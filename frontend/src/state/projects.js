import { atom } from 'recoil'

const projectsAtom = atom({
  key: 'projects',
  default: null,
})

const projectAtom = atom({
  key: 'project',
  default: null,
})

const projectCreateFormAtom = atom({
  key: 'projectCreateForm',
  default: null,
  dangerouslyAllowMutability: true,
})

export { projectsAtom, projectAtom, projectCreateFormAtom }
