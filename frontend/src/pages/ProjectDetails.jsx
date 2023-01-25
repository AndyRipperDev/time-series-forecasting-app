import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'

import { authAtom, projectAtom, projectDatasetViewAtom } from 'state'
import { Link, useParams } from 'react-router-dom'
import { useProjectService } from '../services/project.service'
import LoadingPage from '../components/Loadings/LoadingPage'
import TextHeading from '../components/TextHeading'
import { history } from '../helpers'
import Loading from '../components/Loadings/Loading'

const ProjectDetailsPage = () => {
  const { id } = useParams()
  const projectService = useProjectService()
  const project = useRecoilValue(projectAtom)
  const projectDatasetView = useRecoilValue(projectDatasetViewAtom)
  const [nextPageLoad, setNextPageLoad] = useState(false)
  const [lastPageLoad, setLastPageLoad] = useState(false)
  const [prevPageLoad, setPrevPageLoad] = useState(false)
  const [firstPageLoad, setFirstPageLoad] = useState(false)

  useEffect(() => {
    projectService.getById(id).then((response) => {
      projectService.getDatasetValues(id)
    })

    return () => {
      projectService.resetDatasetView()
      projectService.resetProject()
    }
  }, [])

  function handleDownload(event) {
    projectService.downloadDataset(project)
  }

  function handleDelete(event) {
    projectService.deleteProject(project).then((response) => {
      history.navigate(`/projects`)
    })
  }

  function handleNextPage(event) {
    if (projectDatasetView.nextPage !== null) {
      setNextPageLoad(true)
      projectService
        .getDatasetValues(id, projectDatasetView.nextPage)
        .then(() => {
          setNextPageLoad(false)
        })
    }
  }

  function handlePrevPage(event) {
    if (projectDatasetView.prevPage !== null) {
      setPrevPageLoad(true)
      projectService
        .getDatasetValues(id, projectDatasetView.prevPage)
        .then(() => {
          setPrevPageLoad(false)
        })
    }
  }

  function handleFirstPage(event) {
    setFirstPageLoad(true)
    projectService
      .getDatasetValues(id, projectDatasetView.firstPage)
      .then(() => {
        setFirstPageLoad(false)
      })
  }

  function handleLastPage(event) {
    setLastPageLoad(true)
    projectService
      .getDatasetValues(id, projectDatasetView.lastPage)
      .then(() => {
        setLastPageLoad(false)
      })
  }

  const loading = !project
  const loadingDatasetView = !projectDatasetView

  return (
    <div>
      {loading ? (
        <LoadingPage />
      ) : (
        <div className="w-full px-4 px-12 xl:px-32">
          {project && (
            <div className="mt-12 mx-auto max-w-screen-xl text-center">
              <h1 className="text-3xl font-bold md:text-4xl mb-12">
                {project.title}
              </h1>
              <p>{project.description}</p>
              <div
                className={
                  'mt-12 flex justify-center flex-col md:flex-row items-center'
                }
              >
                <div className="btn-group mx-2 lg:mx-4 my-2">
                  <button
                    className="btn gap-4 hover:text-info"
                    onClick={handleDownload}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Dataset
                  </button>
                  <Link
                    to={`/projects/${project.id}/columns-view`}
                    className={'btn gap-4 hover:text-info'}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      />
                    </svg>
                    View Columns
                  </Link>
                  <Link
                    to={`/projects/${project.id}/forecast-settings`}
                    className={'btn gap-4 hover:text-info'}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    Forecast
                  </Link>
                </div>
                <div className="btn-group mx-2 lg:mx-4 my-2">
                  <Link
                    to={`/projects/${project.id}/columns-check`}
                    className={'btn gap-2 hover:text-info'}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                      />
                    </svg>
                  </Link>
                  <Link
                    to={`/projects/edit/${project.id}`}
                    className={'btn gap-2 hover:text-info'}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </Link>
                  <button
                    onClick={handleDelete}
                    className={`btn ${
                      project.isDeleting ? 'loading' : ''
                    } gap-2 hover:text-error`}
                  >
                    {!project.isDeleting && (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {loadingDatasetView ? (
                <div className={'my-24'}>
                  <Loading />
                </div>
              ) : (
                <div>
                  {projectDatasetView.dataset &&
                  projectDatasetView.dataset.length !== 0 ? (
                    <div className={'my-24'}>
                      <div className={'flex justify-between'}>
                        <h1 className={'text-left text-2xl font-bold my-4'}>
                          Dataset values
                        </h1>
                        <div className={'flex mb-4'}>
                          <p
                            className={
                              'my-auto mx-4 bg-base-200 py-3 px-4 rounded-lg font-semibold'
                            }
                          >
                            {projectDatasetView.currentPage + 1} -{' '}
                            {projectDatasetView.nextPage !== null
                              ? projectDatasetView.nextPage
                              : projectDatasetView.count}{' '}
                            of {projectDatasetView.count}
                          </p>
                          <div className="btn-group my-auto">
                            <button
                              className={`btn ${
                                firstPageLoad ? 'loading' : ''
                              } ${
                                projectDatasetView.prevPage === null
                                  ? 'btn-disabled'
                                  : ''
                              }`}
                              onClick={handleFirstPage}
                            >
                              {!firstPageLoad && (
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                                  />
                                </svg>
                              )}
                            </button>
                            <button
                              className={`btn ${
                                prevPageLoad ? 'loading' : ''
                              } ${
                                projectDatasetView.prevPage === null
                                  ? 'btn-disabled'
                                  : ''
                              }`}
                              onClick={handlePrevPage}
                            >
                              {!prevPageLoad && (
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                              )}
                            </button>
                            <button
                              className={`btn ${
                                nextPageLoad ? 'loading' : ''
                              } ${
                                projectDatasetView.nextPage === null
                                  ? 'btn-disabled'
                                  : ''
                              }`}
                              onClick={handleNextPage}
                            >
                              {!nextPageLoad && (
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              )}
                            </button>
                            <button
                              className={`btn ${
                                lastPageLoad ? 'loading' : ''
                              } ${
                                projectDatasetView.nextPage === null
                                  ? 'btn-disabled'
                                  : ''
                              }`}
                              onClick={handleLastPage}
                            >
                              {!lastPageLoad && (
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto relative shadow-xl rounded-xl">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs uppercase bg-base-300">
                            <tr>
                              {Object.keys(projectDatasetView.dataset[0]).map(
                                (colKey, colIndex) => {
                                  return (
                                    <th
                                      key={colIndex}
                                      scope="col"
                                      className="py-5 px-6 md:px-8"
                                    >
                                      {colKey}
                                    </th>
                                  )
                                }
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {Object.values(projectDatasetView.dataset).map(
                              (rowValue, rowIndex) => {
                                return (
                                  <tr
                                    className="bg-base-200 hover:bg-base-100"
                                    key={rowIndex}
                                  >
                                    {Object.keys(rowValue).map(
                                      (colKey, colIndex) => {
                                        return (
                                          <td
                                            className="py-5 px-6 md:px-8"
                                            key={colIndex}
                                          >
                                            {rowValue[colKey]}
                                          </td>
                                        )
                                      }
                                    )}
                                  </tr>
                                )
                              }
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className={'my-20'}>
                      <h1 className={'text-2xl font-bold my-4'}>
                        No data in dataset
                      </h1>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectDetailsPage
