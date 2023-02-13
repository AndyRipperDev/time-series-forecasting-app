import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'

import { authAtom, projectAtom, projectDatasetViewAtom } from 'state'
import { Link, useParams } from 'react-router-dom'
import { useProjectService } from '../../services/project.service'
import LoadingPage from '../../components/Loadings/LoadingPage'
import TextHeading from '../../components/TextHeading'
import { history } from '../../helpers'
import Loading from '../../components/Loadings/Loading'
import ViewColumnsIcon from '../../components/SVG/Path/General/ViewColumnsIcon'
import ForecastIcon from '../../components/SVG/Path/General/ForecastIcon'
import CheckColumnsIcon from '../../components/SVG/Path/General/CheckColumnsIcon'
import EditIcon from '../../components/SVG/Path/CRUD/EditIcon'
import DeleteIcon from '../../components/SVG/Path/CRUD/DeleteIcon'
import FirstStepIcon from '../../components/SVG/Path/General/Arrows/FirstStepIcon'
import PrevStepIcon from '../../components/SVG/Path/General/Arrows/PrevStepIcon'
import NextStepIcon from '../../components/SVG/Path/General/Arrows/NextStepIcon'
import LastStepIcon from '../../components/SVG/Path/General/Arrows/LastStepIcon'
import DownloadIcon from '../../components/SVG/Path/General/DownloadIcon'

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
    projectService.downloadDataset(project, project.dataset.filename)
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
                    <DownloadIcon size={6}/>
                    Download Dataset
                  </button>
                  <Link
                    to={`/projects/${project.id}/columns-view`}
                    className={'btn gap-4 hover:text-info'}
                  >
                    <ViewColumnsIcon size={6}/>
                    View Columns
                  </Link>
                  <Link
                    to={`/projects/${project.id}/forecast-settings`}
                    className={'btn gap-4 hover:text-info'}
                  >
                    <ForecastIcon size={6}/>
                    Forecast
                  </Link>
                </div>
                <div className="btn-group mx-2 lg:mx-4 my-2">
                  <Link
                    to={`/projects/${project.id}/columns-check`}
                    className={'btn gap-2 hover:text-info'}
                  >
                    <CheckColumnsIcon size={6}/>
                  </Link>
                  <Link
                    to={`/projects/edit/${project.id}`}
                    className={'btn gap-2 hover:text-info'}
                  >
                    <EditIcon size={5}/>
                  </Link>
                  <button
                    onClick={handleDelete}
                    className={`btn ${
                      project.isDeleting ? 'loading' : ''
                    } gap-2 hover:text-error`}
                  >
                    {!project.isDeleting && (
                      <DeleteIcon size={6}/>
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
                                <FirstStepIcon size={6}/>
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
                                <PrevStepIcon size={6}/>
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
                                <NextStepIcon size={6}/>
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
                                <LastStepIcon size={6}/>
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
