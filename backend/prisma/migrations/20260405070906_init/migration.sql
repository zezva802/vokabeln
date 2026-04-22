-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "german" TEXT NOT NULL,
    "article" TEXT,
    "translation" TEXT NOT NULL,
    "type" TEXT,
    "lesson" INTEGER,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "ef" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Word_german_translation_key" ON "Word"("german", "translation");
