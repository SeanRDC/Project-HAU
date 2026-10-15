# English Translation: Lines for Review

The game's dialogue is in Taglish, and English sits beside it (see `src/game/lang.ts`). Every line in the game now has English. This file collects the lines where a person should confirm a choice the translation made.

- **Already English** lines need no translation, because the Tagalog line is already in English.
- **Please check** lines are translated and in the game, but a second opinion would help.
- **Flagged** is where a new line goes when it can't be translated without a decision. A flagged line has no English in the game yet, so English players see the Tagalog. There are none right now.

`npm run check:translations` reads the text in backticks here, so a line listed here is not reported as missing. Keep the Tagalog exactly as it is in the code.

The rules the English follows:
- Conversational words (ha, 'no, naman, sige, pala, talaga, tara) are translated.
- Honorifics stay as they are: Kuya, Ate, Manong, Mang, Aling, and family words like Mama, lola and anak.
- Filipino food names stay as they are, and so does baon: adobo, taho, kanin, ulam, tapa, sinangag, turon, pandesal, sitsirya, kwek-kwek, sago't gulaman and so on. Plain words around them are translated, so English players can follow: egg, soup, coffee, onions, jackfruit, bread.
- Kapampangan stays, followed by its meaning in English.
- po and opo come through as courtesy ("sir", "ma'am", "please").
- Signs and notices in Tagalog are translated, the same as dialogue.

## Flagged

None.

## Already English

These are already English in the Tagalog script, so they show as they are in both languages.

- `Good.` (Kuya Nonoy, `story/gate.ts`)
- `...` (the player, `story/gate.ts` and `story/courtyard.ts`)
- `BOY` and `GIRL` (the character picker, `ui/select.ts`)
- `Immaculate Heart Gymnasium` and `Holy Angel University, Angeles City` (area subtitles, which are names)
- `Laus Deo Semper` and `Laus Deo Semper 1933` (area subtitles, in Latin in both languages)
- `1933`, `1940`, `1981`, `...1933, 1940, 1981... 1933, 1940...` and `Praise God always` (Kath's quiz, `story/park.ts`)
- `"May we always remember what we suffered. May we always celebrate that we triumphed."` (the Memorare marker, `story/park.ts`)
- `Meow.`, `Mrrp.` and `Prrrrr...` (Mingming, `story/courtyard.ts`)

## Please check

These are in the game, but a second opinion would help.

| Where | Tagalog | English in the game | Note |
| --- | --- | --- | --- |
| `story/gate.ts`, Kuya Nonoy before the bag check | `Bag check muna bago pumasok, boss. Kahit si Don Juan pa 'yan.` | Bag check before you go in, boss. Even Don Juan himself would get his bag checked. | Don Juan is Juan D. Nepomuceno, whose bust is in the DJN lobby. An English player at the gate hasn't met him yet and may think of the legendary lover. The lobby and Kath's quiz make it clear later. Should this line already say "the founder"? |
| `story/gate.ts`, looking at the pickup | `Pulang Chevrolet, itim ang mags, may sticker pa ng putik sa pinto. Makintab, bagong hugas. May puting papel na nakaipit sa wiper.` | A red Chevrolet with black mags and a mud-splatter sticker on the door. Shiny, freshly washed. A white slip of paper is tucked under the wiper. | Read as a mud-splatter sticker, since the truck is "freshly washed". If it means actual mud on the door, the English needs changing. |
| `story/gate.ts`, Manong Taho | `Ay, sige na. Bukas na lang, ha? Hindi ka naman tatakbo.` | Ah, it's fine. Tomorrow, then, okay? You're not going anywhere. | Is he letting you pay tomorrow (credit), or telling you to buy tomorrow? The game gives you no taho here. The English keeps both readings open. |
| `story/gate.ts`, the "sandali lang" running joke | `Sandali lang po, Sir! Sandali lang!` | Just a second, sir! Just a second! | "Sandali lang" is translated "just a second" every time (Mikko, your comeback, his "Limang daan. Para sa 'sandali lang'", the enforcer's "Kahit sandali lang"), so the joke carries through. |
| `story/gate.ts`, Mikko | `Sir, baka naman po pwede pang pag-usapan...` | Sir, maybe we could talk this over, please... | Keeps the hint that he's angling to get out of the ticket. The enforcer's "We can. At the office." turns that into paperwork. |
| `story/plaza.ts`, Trisha | `'Wag mo na 'kong i-"po", fourth year lang ako, hindi lola.` | Don't "ma'am" me, I'm just a fourth year, not your lola. | The joke is about "po". In English the player called her "ma'am" the line before, so that's the word she objects to. |
| `story/lobby.ts`, Ate Liza | `Pero sa tagal ko dito, ang tanging nagpaparamdam lang ay 'yung aircon.` | But in all my years here, the only thing that haunts this place is the aircon. | "Nagpaparamdam" is what a ghost does when it makes itself felt. "Haunts" keeps the joke. |
| `ui/title.ts`, `ui/phone.ts`, the game's subtitle | `Unang Araw` | First Day | Translated so English players know what it means. If "Unang Araw" is the game's name and should stay as it is, say so. |
| `story/entry.ts` and `story/plaza.ts`, Ate Weng, Kuya Ramil and the player | `Mayap a gatpanapun!` and `Dakal a salamat, Ate!` | Mayap a gatpanapun! Good afternoon! / Dakal a salamat. Thanks so much, Ate! | The Kapampangan stays, with its meaning after it. CONTEXT.md already asks for a native speaker to check the Kapampangan itself. |
| The phone's "last bought" line | `Piso kay Jopet`, `Pandesal at kape`, `Chips at softdrinks` | (stays as bought) | The phone shows what you last bought, and the save stores that line as it was written. These three names have Tagalog in them, so the phone shows them in Tagalog. The menu choices are in English. Showing them in English would mean changing what the save holds. Ask first. |
