// Which language the words on screen are in. Tagalog (Taglish, really) is
// the game's own language and always the default; English is an extra that
// sits beside it. Every Tagalog string stays where it is, and an English one
// is only used when the player picks English and that line has one.
//
// Writers: add `en: '...'` next to `text: '...'` (on a Line or a Choice). A
// line with no `en` shows its Tagalog in English mode too, never a blank.

export type Lang = 'tl' | 'en';

/** kept apart from the save, so picking a language never touches anyone's progress */
const KEY = 'project-hau-lang';

let current: Lang = 'tl';

export function lang(): Lang {
  return current;
}

/** Switch language; `persist` false (dev shortcuts) leaves the stored choice alone. */
export function setLang(l: Lang, persist = true): void {
  current = l;
  if (!persist) return;
  try {
    localStorage.setItem(KEY, l);
  } catch {
    // private browsing can refuse storage; the choice just lasts this visit
  }
}

export function toggleLang(persist = true): Lang {
  setLang(current === 'tl' ? 'en' : 'tl', persist);
  return current;
}

/** Reads the stored choice, if any. Anything else leaves it on Tagalog. */
export function loadLang(): void {
  try {
    if (localStorage.getItem(KEY) === 'en') current = 'en';
  } catch {
    // blocked storage: stay on Tagalog
  }
}

/** The English if English is on and there is some, otherwise the Tagalog. */
export function tr(tl: string, en?: string): string {
  return current === 'en' && en && en.trim() ? en : tl;
}
