import { atom } from 'recoil'

const projectsAtom = atom({
  key: 'projects',
  default: null,
})

const projectAtom = atom({
  key: 'project',
  default: null,
})

const projectDatasetViewAtom = atom({
  key: 'projectDatasetView',
  default: null,
})

export { projectsAtom, projectAtom, projectDatasetViewAtom }
