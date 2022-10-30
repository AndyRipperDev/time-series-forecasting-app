import { useSetRecoilState, useRecoilState, useResetRecoilState } from 'recoil'

import { history, useAxiosWrapper } from '../helpers'
import { authAtom, projectsAtom, projectAtom, userAtom } from '../state'

export { useProjectService }

function useProjectService() {
  const urlPartProjects = '/projects'
  const setProjects = useSetRecoilState(projectsAtom)
  const setProject = useSetRecoilState(projectAtom)
  const forecastApi = useAxiosWrapper().forecastApi

  return {
    getAll,
    getByAuthUser,
    getById,
    update,
    create,
    delete: _delete,
    resetProjects: useResetRecoilState(projectsAtom),
    resetProject: useResetRecoilState(projectAtom),
  }

  function getAll() {
    return forecastApi
      .get(urlPartProjects)
      .then((response) => response.data)
      .then(setProjects)
  }

  function getByAuthUser() {
    return forecastApi
      .get(`${urlPartProjects}/user`)
      .then((response) => response.data)
      .then(setProjects)
  }

  function getById(id) {
    return forecastApi
      .get(`${urlPartProjects}/${id}`)
      .then((response) => response.data)
      .then(setProject)
  }

  function create(project) {
    return forecastApi.post(urlPartProjects, {
      title: project.title,
      description: project.description,
    })
  }

  function update(id, params) {
    return forecastApi.patch(`${urlPartProjects}/${id}`, params).then((x) => {
      return x
    })
  }

  // prefixed with underscored because delete is a reserved word in javascript
  function _delete(id) {
    setProjects((projects) =>
      projects.map((x) => {
        // add isDeleting prop to user being deleted
        if (x.id === id) return { ...x, isDeleting: true }

        return x
      })
    )

    return forecastApi.delete(`${urlPartProjects}/${id}`).then(() => {
      // remove user from list after deleting
      setProjects((projects) => projects.filter((x) => x.id !== id))
    })
  }
}
