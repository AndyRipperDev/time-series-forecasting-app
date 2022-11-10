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
    getById2,
    update,
    update2,
    update_cols,
    create,
    create2,
    uploadFile,
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

  function getById2(id) {
    return forecastApi
      .get(`${urlPartProjects}/get/${id}`)
      .then((response) => response.data)
      .then(setProject)
  }

  function create(project) {
    return forecastApi.post(urlPartProjects, {
      title: project.title,
      description: project.description,
    })
  }

  function create2(project) {
    const formData = new FormData()
    formData.append('title', project.title)
    formData.append('description', project.description)
    formData.append('delimiter', project.dataset.delimiter)
    formData.append('file', project.file[0])
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    }

    return forecastApi.post(urlPartProjects + '/create', formData, config)
  }

  function uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    }
    return forecastApi.post(urlPartProjects + '/upload', formData, config)
  }

  function update(id, params) {
    return forecastApi
      .patch(`${urlPartProjects}/update/${id}`, params)
      .then((x) => {
        return x
      })
  }

  function update2(id, params) {
    return forecastApi
      .patch(`${urlPartProjects}/update/${id}`, {
        title: params.title,
        description: params.description,
        delimiter: params.dataset.delimiter,
      })
      .then((x) => {
        return x
      })
  }

  function update_cols(id, params) {
    return forecastApi.patch(`/dataset-columns/${id}`, params).then((x) => {
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
