import { useSetRecoilState, useRecoilState, useResetRecoilState } from 'recoil'

import { history, useAxiosWrapper } from '../helpers'
import { authAtom, roleAtom, rolesAtom, userAtom } from '../state'

export { useRoleService }

function useRoleService() {
  const urlPartRoles = '/roles'
  const setRoles = useSetRecoilState(rolesAtom)
  const setRole = useSetRecoilState(roleAtom)
  const forecastApi = useAxiosWrapper().forecastApi

  return {
    getAll,
    getById,
    update,
    create,
    delete: _delete,
    resetRoles: useResetRecoilState(rolesAtom),
    resetRole: useResetRecoilState(roleAtom),
  }

  function getAll() {
    return forecastApi
      .get(urlPartRoles)
      .then((response) => response.data)
      .then(setRoles)
  }

  function getById(id) {
    return forecastApi
      .get(`${urlPartRoles}/${id}`)
      .then((response) => response.data)
      .then(setRole)
  }

  function create(role) {
    return forecastApi.post(urlPartRoles, {
      title: role.title,
      description: role.description,
    })
  }

  function update(id, params) {
    return forecastApi.patch(`${urlPartRoles}/${id}`, params).then((x) => {
      return x
    })
  }

  // prefixed with underscored because delete is a reserved word in javascript
  function _delete(id) {
    setRoles((roles) =>
      roles.map((x) => {
        // add isDeleting prop to user being deleted
        if (x.id === id) return { ...x, isDeleting: true }

        return x
      })
    )

    return forecastApi.delete(`${urlPartRoles}/${id}`).then(() => {
      // remove user from list after deleting
      setRoles((roles) => roles.filter((x) => x.id !== id))
    })
  }
}
