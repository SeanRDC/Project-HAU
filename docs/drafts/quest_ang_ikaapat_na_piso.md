# Quest Draft: Ang Ikaapat na Piso (The Fourth Coin)

> Status: **draft for team review**. Nothing here is in the game yet. All dialogue is a first pass by a non-native speaker and needs proofreading.

## Logline
Jopet, the senior at the plaza fountain, has failed Integral Calculus three times. Every batchmate he started with graduates this year. His family thinks he's graduating with them, and his lola has already ordered the tarpaulin. The player, a first-week Computing freshman, slowly finds out, and helps him do the hardest thing: not pass the exam, but tell the truth.

## Where This Comes From
We wanted the feeling of *3 Idiots*: friendship, pressure, and the gap between what a family expects and what a student can carry. We don't want its plot.

| *3 Idiots* | Our quest |
| --- | --- |
| A genius beats the system | An ordinary student, nothing special, keeps failing |
| A villain director | No villain. The professor is strict but fair, and on Jopet's side |
| Passion vs. the career your parents chose | Shame and silence: hiding the truth from people who sacrificed for you |
| A tragedy among the students | No death or self-harm (see Sensitivity) |
| The big win is brilliance | The big win is a phone call, then a **3.0** |

The details come from situations Filipino college students talk about all the time online and in person. Reddit itself couldn't be reached for this draft, so these are common shared experiences, not anyone's particular post. **No real person's story is retold here**, and none should be:

- Being **irregular**: a failed prerequisite strands you while your block moves on.
- **Pasang-awa**: celebrating a 3.0 like it's a 1.0.
- The **graduation tarp** the family orders before the grades are out.
- An **OFW parent** whose remittance pays the tuition, so failing feels like wasting their sacrifice.
- The **panganay** whose younger sibling wants to follow in their footsteps.
- *"Mag-call center na lang ako"*: the quiet escape plan.
- *"Delayed, not denied"*: what everyone says, and what nobody believes until it's about them.

## Cast
| Who | Role | New or existing |
| --- | --- | --- |
| **Jopet** (Jose Pedro Lansangan) | 5th-year Civil Engineering, panganay, funny on the outside | Existing (plaza) |
| **Trisha** | Senior who keeps complaining about her groupmates. Organised, blunt. Secretly failed Physics once and never told anyone. Becomes the tutor | Existing (plaza) |
| **Migs** | Game dev org recruiter. Helps the player build Jopet a practice game | Existing (courtyard) |
| **Kath** | The crammer you helped review. Shows what memorising without understanding looks like, and grows past it too | Existing (park) |
| **Engr. Dizon** | Jopet's Calculus professor. Strict, tired, cares. Fictional | New |
| **Mama Weng** | Jopet's mother, caregiver in Hong Kong. Only seen on a video call | New (voice and phone screen only) |
| **Nini** | Jopet's sister, Grade 10, wants to be an engineer "like Kuya" | New (phone only, maybe one visit) |
| **Lola Pacing** | Ordered the tarp. Never appears, always mentioned | Off-screen |

> Look at the signature-features plan for Jopet and Trisha before drawing their close-ups. Jopet's signature could be a calculator in a worn case clipped to his bag.

## Structure
The quest spans several in-game days. **That needs a day system** (right now the game is one first day). Each act is one day, and the phone checklist gets a "Jopet" section.

### Act 1: Ang Piso (Day 1, mostly already in the game)
- **Plaza:** Jopet asks for a coin at the fountain ("Pang-apat na subok"). New choice: give him one or don't. Giving it sets `gave_piso`.
- **Lobby:** the "Tutor needed: Calculus. URGENT." poster is already on the board. New: if you met Jopet, the player notices the number is the same one on Jopet's ID lace tag. Sets `saw_tutor_poster`.
- Ending beat (evening, plaza): Jopet is still at the fountain, now alone. He jokes, but the joke doesn't land.

> **Jopet:** Alam mo kung ano nakakatawa? Lahat ng ka-block ko, nagpa-picture na para sa toga.
> **Jopet:** Ako, nagpa-picture din. Sa fountain. Pang-apat na beses.

### Act 2: Ang Tarp (Day 2)
- **Plaza:** Jopet's phone keeps buzzing. Nini sends a photo of the tarp proof: *"CONGRATULATIONS ENGR. JOSE PEDRO LANSANGAN, BATCH 2027."* Lola wants to know if the spelling is right.
- He shows the player because he can't show anyone else.

> **Jopet:** "Engr." na agad. Wala pang board exam, wala pang diploma. Wala pang Calculus.
> **You:** Alam ba nila?
> **Jopet:** Alam nilang gagraduate ako. Kasi 'yun ang sinabi ko.

- Choice:
  - *"Sabihin mo na sa kanila."* → he gets defensive: "Madali sabihin 'yan pag hindi ikaw." (sets `pushed_jopet`)
  - *"Ano'ng kailangan mo?"* → he admits he needs a tutor and nobody answered the poster. (sets `asked_jopet`)
- Either way: find someone who can tutor Calculus.

### Act 3: Ang Tutor (Day 3)
- **Courtyard:** ask around. Bea doesn't know Calculus ("Freshie din ako, ano ka ba"). Kath offers to make him flashcards. It's sweet, but memorising is how Jopet failed three times.
- **Plaza:** Trisha, waiting for her groupmates again, overhears.

> **Trisha:** Integral Calculus? Pang-ilan na?
> **Jopet:** ...Pang-apat.
> **Trisha:** Okay. Bukas, alas-siyete, library. Pag na-late ka, aalis ako.
> **Jopet:** Bakit mo 'ko tutulungan?
> **Trisha:** Kasi 'yung mga groupmates ko, hindi pumupunta. Ikaw, pumunta ka sa fountain apat na beses. At least may sipag ka.

- Sets `found_tutor`. Unlocks the **library** (needs Tuesday's reference photos).

### Act 4: Ang Laro (Day 4)
This is where the player's own course matters.
- **Courtyard:** Migs: "Gumagawa ka ng laro para sa ibang tao? 'Yan na 'yun, 'yan ang game dev."
- **A minigame:** the player and Migs build Jopet a tiny practice game in the SOC org room. In play terms, the player picks which problem types go in from Trisha's notes. (Keep it simple: 3 choices, no real math required of the player.)
- **Library, evening:** Jopet plays it, gets one right, then another. First genuine laugh in the quest.

> **Jopet:** Teka. Naintindihan ko 'yon. Hindi ko kinabisado. *Naintindihan* ko.

- Sets `made_game`.

### Act 5: Ang Tawag (Day 5, the emotional peak)
- **Park, night** (fireflies, lamps on): Jopet is on the bench. Exam is tomorrow. He's decided to tell his mother first, before the result, so that whatever happens, he isn't lying anymore.
- He asks the player to stay. **Close-up cutscene**: the phone screen and Jopet's face.

> **Mama Weng:** Anak! Gabi na diyan ah. Kumain ka na?
> **Jopet:** Ma... may sasabihin po ako.
> *(long pause, the close-up holds)*
> **Jopet:** Hindi po ako gagraduate ngayong taon. Bumagsak po ako sa Calculus. Tatlong beses na po.
> *(pause)*
> **Mama Weng:** ...Tatlong beses? Bakit hindi mo sinabi agad?
> **Jopet:** Kasi po pinapadalhan n'yo ako. Kasi po nandiyan kayo para sa'kin. Nahihiya po ako.
> **Mama Weng:** Anak. Hindi kita pinag-aaral para lang sa tarp ni Lola.
> **Mama Weng:** Pinag-aaral kita para may mapuntahan ka. Kahit matagalan. Hintayin ka namin.

- If `pushed_jopet`: he thanks the player for pushing him even though he got mad.
- If `asked_jopet`: he thanks the player for asking what he needed instead of telling him.
- Sets `told_mama`. The player doesn't fix anything here; they just stay. That's the point.

### Act 6: Ang Tres (Day 6)
- **Morning, Main Gate:** Jopet in line for bag check. Kuya Nonoy, who has seen him every morning for five years:

> **Kuya Nonoy:** Exam mo ngayon, 'no? Ikaw 'yung naghuhulog ng piso. Galingan mo, boss.

- **Afternoon:** the player waits at the fountain (time skip with `T`).
- Jopet runs in. **Close-up.** He holds up his phone: **3.0**.

> **Jopet:** TRES! TRES, PRE! PASANG-AWA!
> **Jopet:** Hindi ko alam kung iiyak ako o tatawa.
> **Trisha:** Pareho. Ganyan talaga ang tres.

- Ending beat: Jopet takes out a coin. He doesn't throw it in the fountain. He gives it to the player.

> **Jopet:** Ikaapat na piso. Hindi ko na kailangan. Itago mo, freshie. Para pag ikaw naman ang kinakabahan.

- The coin becomes a keepsake item on the phone. Sets `jopet_passed`.

### Epilogue (optional, much later in the game)
Jopet's actual graduation, a year late. The tarp is reprinted with the right year. Nini is in the crowd in her senior-high uniform. If the game reaches a graduation chapter, he's in it.

## Flags and Checklist
| Flag | Set when |
| --- | --- |
| `gave_piso` | Player gives Jopet a coin (Day 1) |
| `saw_tutor_poster` | Player connects the poster to Jopet |
| `pushed_jopet` / `asked_jopet` | Choice in Act 2 |
| `found_tutor` | Trisha agrees |
| `made_game` | Practice game finished |
| `told_mama` | The phone call |
| `jopet_passed` | Result day |

Phone checklist lines (Taglish, proofread): "Kausapin si Jopet sa fountain", "Maghanap ng tutor", "Gumawa ng laro kasama si Migs", "Samahan si Jopet sa park", "Hintayin ang resulta".

## What the Game Needs Before This Works
- **A day system:** days, sleeping or going home, and a calendar on the phone.
- **Close-up cutscenes** for Act 5 and Act 6 (see the character plan).
- **New areas:** the library and the SOC org room. **Add both to Tuesday's photo list.** The School of Engineering and Architecture building would also help if Jopet's classes are ever shown.
- **Expressions:** Jopet needs at least neutral, joking, ashamed, crying and laughing.
- **Phone screen UI** for the video call and the tarp photo.
- **A keepsake slot** on the phone for the coin.

## Sensitivity
- **No self-harm or suicide.** *3 Idiots* has a student death. We don't, and we don't hint at it. The game uses a real university's name, and its players will include real students under exam pressure. Jopet's lowest point is "mag-call center na lang ako", not anything darker.
- **No real HAU staff or real students.** Engr. Dizon and everyone else are fictional. If a name turns out to match a real faculty member, change it.
- **The professor isn't the villain.** Keep it that way: making a real department's faculty look cruel is unfair and would reflect on real people.
- **Check HAU's real policies** before naming them: the grading scale (is 3.0 the lowest passing grade at HAU?), retention or maximum-residency rules, and how many times a subject can be retaken. If unsure, keep it vague ("baka ma-kick out na ako sa program").
- **OFW portrayal:** Mama Weng should come across as loving and tired, not as a guilt machine.

## Open Questions for the Team
1. Is Jopet Civil Engineering, or another program? It changes which building we need.
2. Should the practice-game minigame be a real minigame, or just a cutscene?
3. Is the player's own story (a Computing freshman) meant to mirror Jopet's? For example, a parent who wanted them to take Nursing instead.
4. Does the quest need a version where he fails a fourth time? It's more honest but much harder to end well. The current draft says no.
