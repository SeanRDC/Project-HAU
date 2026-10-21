# The opening: script

Everything in the manga opening, page by page, as it plays now (`PAGES` in `opening.gd`).
The story it sets up is in [STORY.md](STORY.md).

**Trigger warning:** the opening touches on depression, suicide and grief. Nothing is shown.

Each page fills the screen; its panels fade in one at a time and drift slowly, and each
line types out in a corner of its panel (L / R top corners, BL / BR bottom corners, C
middle). A key or click moves on. The first time it can't be skipped; after it has been
watched once, holding Space (or Esc) skips to the game. "Ikaw" is never named: the pictures
keep switching between Pat and Ysha. The English is only a gloss for the team.

Pictures: `panels/<id>.png` if drawn, else `photos/<id>.jpg` (a campus photo inked by the
manga shader), else a grey card naming what to draw.

| Page | Picture | Lines | English |
| --- | --- | --- | --- |
| 1 | blank page, specks; `alaala` (to draw) | Naaalala ko... | I remember... |
| 2 | `langit` (drawn clouds) | Ang lugar na 'yon... | That place... |
| 2 | `fountain` (photo) | Ang unibersidad na pinasukan ko noon... / ...ang Holy Angel. | The university I went to back then... Holy Angel. |
| 3 | `walkway` (photo) | Mahahaba ang mga walkway sa boulevard... / ...kung saan madami nagmamadali dahil sa init. | The walkways were long... where so many hurried because of the heat. |
| 3 | `chapel` (photo) | Sa dulo ng daan, ang kapilya. | At the end of the road, the chapel. |
| 3 | `klase` (photo) | Eto naman classroom namin, tahimik pag walang tao. | This is our classroom, quiet when no one's around. |
| 4 | `corridor` (photo) | Sa ikalimang palapag ang una kong klase. | My first class was on the fifth floor. |
| 4 | `stairs` (photo) | Matarik ang hagdan paakyat. | The stairs up were steep. |
| 4 | `hallway` (photo) | Sa pasilyo ng APS... / ...laging may nagmamadali papuntang canteen. | In the APS hallway... someone always hurrying to the canteen. |
| 5 | `kantina` (photo) | Sa canteen, sa kabilang mesa ka lagi nakaupo. / Hindi ako lumilipat. | At the canteen, you always sat at the other table. I never moved over. |
| 5 | `gym` (photo) | Sa gym kita unang nakilala. / Mainit noon. Amoy pawis. | The gym is where I first met you. It was hot. It smelled of sweat. |
| 6 | `tawanan` (photo) | "Okay lang ako," sabi mo. / Hindi naman kita tinanong. | "I'm fine," you said. I hadn't even asked. |
| 6 | `bangko` (photo) | 2:14 AM. "Gising ka pa?" / Nakita ko kinaumagahan. | 2:14 AM. "Are you still up?" I saw it the next morning. |
| 7 | `lakad` (photo) | Binigay mo sa'kin ang paborito mong ballpen. / Nawala ko sa loob ng isang linggo. | You gave me your favourite pen. I lost it within a week. |
| 7 | `tagulan` (photo, rain drawn over) | Pagdating ng tag-ulan... / ...ikaw na lang ang hindi sumisilong. | When the rainy season came... you were the only one who didn't run for shelter. |
| 8 | blank page, specks | Nobyembre 11. / Sana nagtanong ako. / Sana nakinig ako. / Sana hindi kita iniwan mag-isa. / ...sana sinagot ko. | November 11. I wish I'd asked. I wish I'd listened. I wish I hadn't left you alone. ...I wish I'd answered. |
| 9 | `mata` (to draw), on black | Kung pwede lang bumalik... / ...hindi na kita pababayaan. | If only I could go back... I would never leave you alone again. |

Then the title card, "PROJECT HAU", and the game starts.

To check every screen without playing it: `tools\preview-opening.cmd`. To change it, edit
`PAGES` in `opening.gd` and keep this script in step.
