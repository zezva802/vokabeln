import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

function parseLine(raw: string) {
  const line = raw.trim();
  if (!line) return null;

  const parts = line.split(/\s*[–-]\s*/);
  // formats:
  // infinitiv – imperfekt – partizip2 – hilfsverb – translation
  // infinitiv – praesens – imperfekt – partizip2 – hilfsverb – translation
  if (parts.length < 4) return null;

  if (parts.length >= 6) {
    return {
      infinitiv: parts[0].trim(),
      praesens: parts[1].trim() || null,
      imperfekt: parts[2].trim(),
      partizip2: parts[3].trim(),
      hilfsverb: parts[4].trim().toLowerCase(),
      translation: parts[5]?.trim() || null,
    };
  }

  return {
    infinitiv: parts[0].trim(),
    praesens: null,
    imperfekt: parts[1].trim(),
    partizip2: parts[2].trim(),
    hilfsverb: parts[3].trim().toLowerCase(),
    translation: parts[4]?.trim() || null,
  };
}

@Injectable()
export class VerbsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.verb.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async bulkImport(lines: string[]) {
    const parsed = lines.map(parseLine).filter(Boolean) as NonNullable<ReturnType<typeof parseLine>>[];
    let added = 0;
    let skipped = 0;

    for (const entry of parsed) {
      const existing = await this.prisma.verb.findFirst({ where: { infinitiv: entry.infinitiv } });
      if (existing) { skipped++; continue; }
      try {
        await this.prisma.verb.create({ data: entry });
        added++;
      } catch (e: any) {
        if (e.code === 'P2002') skipped++;
        else throw e;
      }
    }

    return { added, skipped };
  }

  remove(id: string) {
    return this.prisma.verb.delete({ where: { id } });
  }

  removeAll() {
    return this.prisma.verb.deleteMany();
  }
}
