import { atom, selector } from 'recoil'

export const navBigViewAtom = atom({
  key: 'navBigView',
  default: false
});

export const toggleNavBigViewAtom = selector({
  key: 'navBigViewToggle',
  get: ({get}) => {
    return get(navBigViewAtom)
  },
  set:({get, set}) => {
    const currentValue = get(navBigViewAtom)
    set(navBigViewAtom, !currentValue)
  }
});