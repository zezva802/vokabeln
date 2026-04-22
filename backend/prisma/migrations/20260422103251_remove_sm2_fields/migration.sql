/*
  Warnings:

  - You are about to drop the column `dueAt` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `ef` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `interval` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `reps` on the `Word` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[german]` on the table `Word` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Word_german_translation_key";

-- AlterTable
ALTER TABLE "Word" DROP COLUMN "dueAt",
DROP COLUMN "ef",
DROP COLUMN "interval",
DROP COLUMN "reps";

-- CreateTable
CREATE TABLE "Verb" (
    "id" TEXT NOT NULL,
    "infinitiv" TEXT NOT NULL,
    "praesens" TEXT,
    "imperfekt" TEXT NOT NULL,
    "partizip2" TEXT NOT NULL,
    "hilfsverb" TEXT NOT NULL,
    "translation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verb_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Verb_infinitiv_key" ON "Verb"("infinitiv");

-- CreateIndex
CREATE UNIQUE INDEX "Word_german_key" ON "Word"("german");
