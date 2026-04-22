# Vokabeln

German vocabulary flashcard app.

## Requirements

- [Node.js](https://nodejs.org/) (v20+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the database)

## Setup (first time only)

**1. Clone the repo**
```bash
git clone https://github.com/zezva/vokabeln.git
cd vokabeln
```

**2. Set up environment**
```bash
cp backend/.env.example backend/.env
```

**3. Start the database**
```bash
docker-compose up -d
```

**2. Install dependencies**
```bash
npm install
npm run install:all
```

**3. Run database migrations**
```bash
cd backend
npx prisma migrate deploy
cd ..
```

## Start

```bash
npm start
```

Opens on **http://localhost:4000**

## Stop

`Ctrl+C` to stop the app. To also stop the database:
```bash
docker-compose down
```

Your words are saved between sessions.

---

## Features

- **Practice** — flashcard drill mode. Pick a batch size (10/20/50) and a group. Answer right twice in a row to retire a word from the session.
- **Verbs** — verb conjugation practice.
- **Words** — view all vocabulary, search, filter by import date, delete words.
- **Importieren** — paste words or verbs to add them to the database.

---

## Word import format

```
die Mutter – დედა
kochen – საჭმლის მომზადება
der Freund – Freund
das Kind – Kind
```

Articles (`der`, `die`, `das`) are detected automatically. Separator can be `–` or `-`.

## Verb import format

```
backen – er bäckt – backte – gebacken – haben – გამოცხობა
beginnen – er beginnt – begann – begonnen – haben – დაწყება
```

Format: `infinitiv – [präsens –] imperfekt – partizip II – hilfsverb – übersetzung`
