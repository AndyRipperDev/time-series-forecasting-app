import { useSetRecoilState, useRecoilState, useResetRecoilState } from 'recoil'

import { history, useAxiosWrapper } from '../helpers'
import { authAtom, rolesAtom } from '../state'

export { useRoleService }

function useRoleService() {
  const urlPartRoles = '/roles'
  const setRoles = useSetRecoilState(rolesAtom)
  const forecastApi = useAxiosWrapper().forecastApi

  return {
    getAll,
    update,
    create,
    delete: _delete,
    resetRoles: useResetRecoilState(rolesAtom),
  }

  function getAll() {
    return forecastApi
      .get(urlPartRoles)
      .then((response) => response.data)
      .then(setRoles)
  }

  function create(role) {
    return forecastApi.post(urlPartRoles, {
      title: role.title,
      description: role.description,
    })
  }

  function update(id, params) {
    return forecastApi.patch(`${urlPartRoles}/${id}`, params).then((x) => {
      // update stored user if the logged in user updated their own record
      // if (id === auth?.user?.id) {
      //   // update local storage
      //   const user = { ...auth, ...params }
      //   localStorage.setItem('user', JSON.stringify(user))
      //
      //   // update auth user in recoil state
      //   setAuth(user)
      // }
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
