// Run: npx ts-node seed.ts
// Make sure backend is running first

const WORDS = `
Wie heißen Sie? – რა გქვიათ?
Ich heiße – მე მქვია
haben – ქონა / ყოლა
kommen – მოსვლა
sagen – თქმა
hören – მოსმენა
das Lied – სიმღერა
der Name – სახელი
die Frau – ქალი
Auf Wiedersehen – ნახვამდის
Guten Tag – დღე მშვიდობისა
Guten Morgen – დილა მშვიდობის
Guten Abend – საღამო მშვიდობის
Gute Nacht – ღამე მშვიდობის
Wie geht es Ihnen? – როგორ ხართ?
tschüs – ნახვამდის
sehen – ნახვა
der Beruf – პროფესია
machen – გაკეთება
die Ausbildung – პროფესიული სწავლა
verheiratet – დაქორწინებული
geschieden – განქორწინებული
das Kind – ბავშვი
leben – ცხოვრება
allein – მარტო
das Alter – ასაკი
der Wohnort – საცხოვრებელი ადგილი
die Herkunft – წარმომავლობა
der Arbeitgeber – დამსაქმებელი
der Familienstand – ოჯახური მდგომარეობა
die Hochschule – უმაღლესი სასწავლებელი
die Schule – სკოლა
studieren – სწავლა უნივერსიტეტში
arbeitslos – უმუშევარი
der Architekt – არქიტექტორი
der Arzt – ექიმი
der Ingenieur – ინჟინერი
der Lehrer – მასწავლებელი
der Student – სტუდენტი
glauben – ფიქრი / დაჯერება
richtig – სწორი
falsch – არასწორი
die Mutter – დედა
das Bild – სურათი
die Eltern – მშობლები
die Geschwister – და-ძმანი
die Großeltern – ბებია-ბაბუა
der Ehemann – ქმარი
die Ehefrau – ცოლი
die Familie – ოჯახი
der Vater – მამა
die Tochter – ქალიშვილი
die Großmutter – ბებია
der Großvater – ბაბუა
die Sprache – ენა
der Freund – მეგობარი
der Kollege – კოლეგა
genau – ზუსტად
mehr – მეტი
der Stern – ვარსკვლავი
das Sternzeichen – ზოდიაქოს ნიშანი
der Sänger – მომღერალი
die Heimatstadt – მშობლიური ქალაქი
singen – სიმღერა
kochen – საჭმლის მომზადება
die Fremdsprache – უცხო ენა
bald – მალე
fertig – მზად
jetzt – ახლა
der Stammbaum – საგვარეულო ხე
groß – დიდი
klein – პატარა
kurz – მოკლე
lang – გრძელი
modern – თანამედროვე
schön – ლამაზი
schwer – მძიმე
leicht – მსუბუქი / მარტივი
der Euro – ევრო
der Preis – ფასი
kosten – ღირებულება
günstig – ხელსაყრელი
billig – იაფი
teuer – ძვირი
das Zimmer – ოთახი
brauchen – საჭიროება
der Hund – ძაღლი
fliegen – გაფრენა
fragen – კითხვა
die Zeitung – გაზეთი
gehen – წასვლა / სიარული
denken – ფიქრი
wirklich – ნამდვილად
die Aufgabe – დავალება
der Kaffee – ყავა
das Geschenk – საჩუქარი
das Geld – ფული
die Lösung – პასუხი
der Tipp – რჩევა
gerne – სიამოვნებით
die Farbe – ფერი
schwarz – შავი
weiß – თეთრი
blau – ლურჯი
braun – ყავისფერი
gelb – ყვითელი
rot – წითელი
grün – მწვანე
der Frühling – გაზაფხული
das Glas – მინა
rund – მრგვალი
neu – ახალი
das Material – მასალა
das Bett – საწოლი
die Lampe – ნათურა
der Schrank – კარადა
der Sessel – სავარძელი
das Sofa – დივანი
der Stuhl – სკამი
der Teppich – ხალიჩა
der Tisch – მაგიდა
die Brille – სათვალე
`.trim();

async function seed() {
  const lines = WORDS.split('\n').filter(l => l.trim());
  const res = await fetch('http://localhost:4001/api/words/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines }),
  });
  const data = await res.json() as { added: number; skipped: number };;
  console.log(`✠ Seed complete: ${data.added} added, ${data.skipped} skipped`);
}

seed().catch(console.error);
