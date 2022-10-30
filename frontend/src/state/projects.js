import { atom } from 'recoil';

const projectsAtom = atom({
  key: 'projects',
  default: null
});

const projectAtom = atom({
  key: 'project',
  default: null,
})


export { projectsAtom, projectAtom };