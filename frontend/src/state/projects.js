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

const projectDatasetColumnsAtom = atom({
  key: 'projectDatasetColumns',
  default: null,
})

const projectDatasetColumnsViewAtom = atom({
  key: 'projectDatasetColumnsView',
  default: null,
})

const projectDatasetColumnOptionsAtom = atom({
  key: 'projectDatasetColumnOptions',
  default: null,
})

const projectDatasetTimePeriodOptionsAtom = atom({
  key: 'projectDatasetTimePeriodOptions',
  default: null,
})

const projectTimePeriodAtom = atom({
  key: 'projectTimePeriod',
  default: null,
})

export {
  projectsAtom,
  projectAtom,
  projectDatasetViewAtom,
  projectDatasetColumnsViewAtom,
  projectDatasetColumnOptionsAtom,
  projectDatasetTimePeriodOptionsAtom,
  projectDatasetColumnsAtom,
  projectTimePeriodAtom,
}
