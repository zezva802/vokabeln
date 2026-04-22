import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma.service';

export interface SentenceQuestion {
  englishSentence: string;
  germanSentence: string;
  acceptedVariations: string[];
  focusWord: string;
  focusTranslation: string;
}

export interface CheckResult {
  correct: boolean;
  close: boolean;
  germanSentence: string;
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[.,!?;:"""'']/g, '').replace(/\s+/g, ' ').trim();
}

@Injectable()
export class SentencesService {
  private anthropic: Anthropic;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.anthropic = new Anthropic({ apiKey: this.config.get('ANTHROPIC_API_KEY') });
  }

  async getQuestion(): Promise<SentenceQuestion> {
    const count = await this.prisma.word.count();
    if (count === 0) throw new Error('No words in database');

    const word = await this.prisma.word.findFirst({
      skip: Math.floor(Math.random() * count),
      select: { german: true, article: true, translation: true },
    });

    if (!word) throw new Error('No word found');

    const fullWord = word.article ? `${word.article} ${word.german}` : word.german;

    const prompt = `You are a German language teacher. Write a simple German sentence (max 10 words) using the word "${fullWord}".

Return ONLY valid JSON:
{
  "englishSentence": "Natural English translation of the sentence",
  "germanSentence": "The correct German sentence",
  "acceptedVariations": ["2-4 alternative correct phrasings, all lowercase, no punctuation, including the main sentence normalized"]
}

Rules:
- Sentence must be simple and natural
- acceptedVariations must all be lowercase with no punctuation marks`;

    const message = await this.anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text.trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found in response');
    const data = JSON.parse(match[0]);

    return {
      englishSentence: data.englishSentence,
      germanSentence: data.germanSentence,
      acceptedVariations: data.acceptedVariations,
      focusWord: fullWord,
      focusTranslation: word.translation,
    };
  }

  check(userAnswer: string, acceptedVariations: string[]): CheckResult {
    const normalized = normalize(userAnswer);
    const correct = acceptedVariations.some(v => normalize(v) === normalized);

    // "close" = at least 80% of words match
    let close = false;
    if (!correct && acceptedVariations.length > 0) {
      const userWords = new Set(normalized.split(' '));
      const bestMatch = Math.max(...acceptedVariations.map(v => {
        const vWords = normalize(v).split(' ');
        const matches = vWords.filter(w => userWords.has(w)).length;
        return matches / Math.max(vWords.length, userWords.size);
      }));
      close = bestMatch >= 0.7;
    }

    return { correct, close, germanSentence: acceptedVariations[0] ?? '' };
  }
}
