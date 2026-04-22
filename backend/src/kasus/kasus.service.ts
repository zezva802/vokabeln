import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma.service';

export interface KasusQuestion {
  sentenceWithBlank: string;
  sentenceFull: string;
  correctArticle: string;
  correctCase: string;
  noun: string;
  nominativArticle?: string;
  explanation: string;
  isNewWord: boolean;
  translation?: string;
}

const CASES = ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'] as const;

const SINGULAR_FORMS: Record<string, Record<string, string>> = {
  der: { Nominativ: 'der', Akkusativ: 'den', Dativ: 'dem', Genitiv: 'des' },
  die: { Nominativ: 'die', Akkusativ: 'die', Dativ: 'der', Genitiv: 'der' },
  das: { Nominativ: 'das', Akkusativ: 'das', Dativ: 'dem', Genitiv: 'des' },
};

@Injectable()
export class KasusService {
  private anthropic: Anthropic;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.anthropic = new Anthropic({ apiKey: this.config.get('ANTHROPIC_API_KEY') });
  }

  async getQuestion(): Promise<KasusQuestion> {
    const useExisting = Math.random() < 0.5;
    const targetCase = CASES[Math.floor(Math.random() * CASES.length)];

    if (useExisting) {
      return this.questionFromDb(targetCase);
    } else {
      return this.questionNew(targetCase);
    }
  }

  private async questionFromDb(targetCase: string): Promise<KasusQuestion> {
    const count = await this.prisma.word.count({ where: { article: { not: null } } });
    if (count === 0) return this.questionNew(targetCase);

    const word = await this.prisma.word.findFirst({
      where: { article: { not: null } },
      select: { german: true, article: true, translation: true },
      skip: Math.floor(Math.random() * count),
    });

    if (!word) return this.questionNew(targetCase);

    const correctArticle = SINGULAR_FORMS[word.article!.toLowerCase()]?.[targetCase];
    if (!correctArticle) return this.questionNew(targetCase);

    const prompt = `Write a short German sentence (max 8 words) where "${word.german}" is used in the ${targetCase} case with article "${correctArticle}".

Return ONLY valid JSON:
{
  "sentenceWithBlank": "sentence where ${correctArticle} is replaced with _____",
  "sentenceFull": "full sentence",
  "explanation": "one sentence in English: why ${targetCase} is used here"
}`;

    const data = await this.callClaude(prompt);
    return {
      sentenceWithBlank: data.sentenceWithBlank,
      sentenceFull: data.sentenceFull,
      correctArticle,
      correctCase: targetCase,
      noun: word.german,
      nominativArticle: word.article ?? undefined,
      explanation: data.explanation,
      isNewWord: false,
      translation: word.translation ?? undefined,
    };
  }

  private async questionNew(targetCase: string): Promise<KasusQuestion> {
    const prompt = `You are a German grammar teacher. Pick a common German noun (singular OR plural, your choice) and write a short sentence (max 8 words) where it appears in the ${targetCase} case.

Rules:
- Pick a useful, common everyday noun
- Can be singular or plural
- Sentence must be natural and simple

Return ONLY valid JSON:
{
  "noun": "base form of the noun (e.g. Hund or Kinder)",
  "nominativArticle": "nominativ article of the noun (der/die/das), or null if plural",
  "correctArticle": "the declined article in the sentence (der/die/das/den/dem/des/den for plural dative)",
  "sentenceWithBlank": "sentence where the article is replaced with _____",
  "sentenceFull": "full sentence with correct article",
  "translation": "English translation of the noun",
  "explanation": "one sentence in English: why ${targetCase} is used here"
}`;

    const data = await this.callClaude(prompt);
    return {
      sentenceWithBlank: data.sentenceWithBlank,
      sentenceFull: data.sentenceFull,
      correctArticle: data.correctArticle,
      correctCase: targetCase,
      noun: data.noun,
      nominativArticle: data.nominativArticle ?? undefined,
      explanation: data.explanation,
      isNewWord: true,
      translation: data.translation,
    };
  }

  private async callClaude(prompt: string): Promise<any> {
    const message = await this.anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = (message.content[0] as { type: string; text: string }).text.trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object found in Claude response');
    return JSON.parse(match[0]);
  }
}
