import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const ARTICLE_REGEX = /^(der|die|das)\s+/i;
const TYPE_MAP: Record<string, string> = {
  der: 'masculine noun',
  die: 'feminine noun',
  das: 'neuter noun',
};

function parseGermanLine(raw: string): {
  german: string;
  article?: string;
  translation: string;
  type?: string;
} | null {
  const line = raw.trim().replace(/^\d+\.\s*/, '').replace(/^\(\d+\)\s*/, '').trim();
  if (!line) return null;

  const sep = line.includes('–') ? '–' : line.includes(' - ') ? ' - ' : '\t';
  const parts = line.split(sep);
  if (parts.length < 2) return null;

  let german = parts[0].trim();
  const translation = parts.slice(1).join(sep).trim();
  if (!german || !translation) return null;

  let article: string | undefined;
  let type: string | undefined;

  const m = german.match(ARTICLE_REGEX);
  if (m) {
    article = m[0].trim();
    german = german.slice(m[0].length).trim();
    type = TYPE_MAP[article.toLowerCase()];
  }

  return { german, article, translation, type };
}

@Injectable()
export class WordsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.word.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async create(data: { german: string; article?: string; translation: string; type?: string; lesson?: number }) {
    try {
      return await this.prisma.word.create({ data });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Word already exists');
      throw e;
    }
  }

  async bulkImport(lines: string[]) {
    const parsed = lines.map(parseGermanLine).filter(Boolean) as ReturnType<typeof parseGermanLine>[];
    let added = 0;
    let skipped = 0;

    for (const entry of parsed) {
      const existing = await this.prisma.word.findFirst({ where: { german: entry!.german } });
      if (existing) { skipped++; continue; }
      try {
        await this.prisma.word.create({ data: entry! });
        added++;
      } catch (e: any) {
        if (e.code === 'P2002') skipped++;
        else throw e;
      }
    }

    return { added, skipped };
  }

  async remove(id: string) {
    const word = await this.prisma.word.findUnique({ where: { id } });
    if (!word) return { message: 'Word not found or already deleted' };
    return this.prisma.word.delete({ where: { id } });
  }

  removeAll() {
    return this.prisma.word.deleteMany();
  }
}
