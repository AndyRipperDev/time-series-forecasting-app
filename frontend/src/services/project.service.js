import { useSetRecoilState, useRecoilState, useResetRecoilState } from 'recoil'

import { history, useAxiosWrapper } from '../helpers'
import {
  authAtom,
  projectsAtom,
  projectAtom,
  userAtom,
  projectDatasetViewAtom,
  projectDatasetColumnsViewAtom,
  projectDatasetColumnOptionsAtom,
  projectDatasetTimePeriodOptionsAtom,
  projectDatasetColumnsAtom,
  projectTimePeriodAtom,
} from '../state'

export { useProjectService }

function useProjectService() {
  const urlPartProjects = '/projects'
  const urlPartColumns = '/dataset-columns'
  const urlPartTimePeriod = '/time-period'
  const setProjects = useSetRecoilState(projectsAtom)
  const setProject = useSetRecoilState(projectAtom)
  const setProjectTimePeriod = useSetRecoilState(projectTimePeriodAtom)
  const setProjectDatasetColumnOptions = useSetRecoilState(
    projectDatasetColumnOptionsAtom
  )
  const setProjectDatasetTimePeriodOptions = useSetRecoilState(
    projectDatasetTimePeriodOptionsAtom
  )
  const setProjectDatasetView = useSetRecoilState(projectDatasetViewAtom)
  const setProjectDatasetColumns = useSetRecoilState(projectDatasetColumnsAtom)
  const setProjectDatasetColumnsView = useSetRecoilState(
    projectDatasetColumnsViewAtom
  )
  const forecastApi = useAxiosWrapper().forecastApi

  return {
    getAll,
    getByAuthUser,
    getById,
    getDatasetValues,
    getDatasetColumns,
    getDatasetColumnValues,
    getDatasetColumnOptions,
    getDatasetTimePeriodOptions,
    getProjectTimePeriod,
    update,
    updateWithDataset,
    updateDatasetColumns,
    create,
    createWithDataset,
    uploadDataset,
    downloadDataset,
    delete: _delete,
    deleteProject,
    resetProjects: useResetRecoilState(projectsAtom),
    resetProject: useResetRecoilState(projectAtom),
    resetDatasetView: useResetRecoilState(projectDatasetViewAtom),
    resetDatasetColumnsView: useResetRecoilState(projectDatasetColumnsViewAtom),
    resetDatasetColumns: useResetRecoilState(projectDatasetColumnsAtom),
    resetDatasetColumnOptions: useResetRecoilState(
      projectDatasetColumnOptionsAtom
    ),
    resetDatasetTimePeriodOptions: useResetRecoilState(
      projectDatasetTimePeriodOptionsAtom
    ),
    resetProjectTimePeriod: useResetRecoilState(projectTimePeriodAtom),
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

  function getDatasetValues(projectId, skip = 0, limit = 100) {
    return forecastApi
      .get(
        `${urlPartProjects}/get-dataset-values/${projectId}/?skip=${skip}&limit=${limit}`
      )
      .then((response) => response.data)
      .then(setProjectDatasetView)
  }

  function getDatasetColumnValues(
    projectId,
    skip = 0,
    limit = 1000,
    column = null,
    allValues = false,
    useScaledValues = true
  ) {
    return forecastApi
      .get(
        `${urlPartProjects}/get-dataset-columns-with-values/${projectId}/?skip=${skip}&limit=${limit}${
          column ? '&column=' + column : ''
        }${allValues ? '&all_values=' + allValues : ''}${!useScaledValues ? '&use_scaled_values=' + useScaledValues : ''}`
      )
      .then((response) => response.data)
      .then(setProjectDatasetColumnsView)
  }

  function getDatasetColumnOptions() {
    return forecastApi
      .get(urlPartColumns + '/column-options')
      .then((response) => response.data)
      .then(setProjectDatasetColumnOptions)
  }

  function getDatasetColumns(projectId) {
    return forecastApi
      .get(`${urlPartColumns}/get-with-project-id/${projectId}`)
      .then((response) => response.data)
      .then(setProjectDatasetColumns)
  }

  function getDatasetTimePeriodOptions() {
    return forecastApi
      .get(urlPartTimePeriod)
      .then((response) => response.data)
      .then(setProjectDatasetTimePeriodOptions)
  }

  function getProjectTimePeriod(projectId) {
    return forecastApi
      .get(`${urlPartTimePeriod}/project/${projectId}`)
      .then((response) => response.data)
      .then(setProjectTimePeriod)
  }

  function create(project) {
    return forecastApi.post(urlPartProjects, {
      title: project.title,
      description: project.description,
    })
  }

  function createWithDataset(project) {
    const formData = new FormData()
    formData.append('title', project.title)
    formData.append('description', project.description)
    formData.append('delimiter', project.dataset.delimiter)
    formData.append('time_period_value', project.dataset.time_period.value)
    formData.append('time_period_unit', project.dataset.time_period.unit)
    formData.append('file', project.file[0])
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    }

    return forecastApi.post(
      urlPartProjects + '/create-with-dataset',
      formData,
      config
    )
  }

  function uploadDataset(file) {
    const formData = new FormData()
    formData.append('file', file)
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    }
    return forecastApi.post(
      urlPartProjects + '/upload-dataset',
      formData,
      config
    )
  }

  function downloadDataset(project, filename) {
    return forecastApi({
      url: `${urlPartProjects}/download-dataset/${project.id}`,
      method: 'GET',
      responseType: 'blob', // important
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
    })
  }

  function update(id, params) {
    return forecastApi.patch(`${urlPartProjects}/${id}`, params).then((x) => {
      return x
    })
  }

  function updateWithDataset(id, params) {
    return forecastApi
      .patch(`${urlPartProjects}/update-with-dataset/${id}`, {
        title: params.title,
        description: params.description,
        delimiter: params.dataset.delimiter,
        time_period_value: params.dataset.time_period.value,
        time_period_unit: params.dataset.time_period.unit,
      })
      .then((x) => {
        return x
      })
  }

  function updateDatasetColumns(id, params) {
    return forecastApi.patch(`${urlPartColumns}/${id}`, params).then((x) => {
      return x
    })
  }

  function _delete(id) {
    setProjects((projects) =>
      projects.map((x) => {
        if (x.id === id) return { ...x, isDeleting: true }

        return x
      })
    )

    return forecastApi.delete(`${urlPartProjects}/${id}`).then(() => {
      setProjects((projects) => projects.filter((x) => x.id !== id))
    })
  }

  function deleteProject(project) {
    setProject({ ...project, isDeleting: true })

    return forecastApi.delete(`${urlPartProjects}/${project.id}`).then(() => {
      setProject(null)
    })
  }
}
