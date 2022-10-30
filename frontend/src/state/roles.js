import { atom } from 'recoil'

const rolesAtom = atom({
  key: 'roles',
  default: null,
})

const roleAtom = atom({
  key: 'role',
  default: null,
})

export { rolesAtom, roleAtom }
