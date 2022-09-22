import { atom } from 'recoil';

export const themeAtom = atom({
  key: 'theme',
  default: (!('theme' in localStorage)) ? 'dark' : localStorage.theme
});
