import { useEffect } from 'react'
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

  useEffect(() => {
    projectService.getById(id).then(response => {
      projectService.getDatasetValues(id)
    })

    return projectService.resetDatasetView
  }, [])


  function handleDownload(event) {
    projectService.downloadDataset(project)
  }

  function handleDelete(event) {
    projectService.delete(project.id).then((response) => {
      history.navigate(`/projects`)
    })
  }

  function handleNextPage(event) {
    if (projectDatasetView.nextPage !== null) {
      projectService.getDatasetValues(id, projectDatasetView.nextPage)
    }
  }

  function handlePrevPage(event) {
    if (projectDatasetView.prevPage !== null) {
      projectService.getDatasetValues(id, projectDatasetView.prevPage)
    }
  }

  function handleFirstPage(event) {
    projectService.getDatasetValues(id, projectDatasetView.firstPage)
  }

  function handleLastPage(event) {
    projectService.getDatasetValues(id, projectDatasetView.lastPage)
  }

  const loading = !project
  const loadingDatasetView = !projectDatasetView

  return(
    <div>
      {loading ? (
        <LoadingPage />
      ) : (
        <div className="w-full px-4 px-12 xl:px-32">
          {project && (
            <div className="mt-12 mx-auto max-w-screen-xl text-center">
              <h1 className="text-3xl font-bold md:text-4xl mb-12">{project.title}</h1>
              <p>{project.description}</p>
              <div className={'mt-12 flex justify-center'}>
                <button className="btn btn-primary mx-2 gap-2" onClick={handleDownload}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Dataset
                </button>
                <Link
                  to={`/projects/edit/${project.id}`}
                  className={'btn btn-info mx-2 btn-outline gap-2'}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Edit Project
                </Link>
                <button
                  onClick={handleDelete}
                  className={`btn ${
                    project.isDeleting ? 'loading' : ''
                  } mx-2 btn-error btn-outline gap-2`}
                >
                  {!project.isDeleting && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  )}
                  Delete Project
                </button>
              </div>

              {loadingDatasetView ? (
                <div className={'my-20'}>
                  <Loading />
                </div>
              ) : (
                <div>
                  {projectDatasetView.dataset && projectDatasetView.dataset.length !== 0 ? (
                    <div className={'my-20'}>
                      <div className={'flex justify-between'}>
                        <h1 className={'text-left text-2xl font-bold my-4'}>Dataset values</h1>
                        <div className={'flex mb-4'}>
                          <p className={'my-auto mx-4 bg-base-200 py-3 px-4 rounded-lg font-semibold'}>{projectDatasetView.currentPage + 1} - {projectDatasetView.nextPage !== null ? projectDatasetView.nextPage : projectDatasetView.count} of {projectDatasetView.count}</p>
                          <div className="btn-group my-auto">
                            <button className={`btn ${projectDatasetView.prevPage === null ? 'btn-disabled' : ''}`} onClick={handleFirstPage}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg></button>
                            <button className={`btn ${projectDatasetView.prevPage === null ? 'btn-disabled' : ''}`} onClick={handlePrevPage}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                            <button className={`btn ${projectDatasetView.nextPage === null ? 'btn-disabled' : ''}`} onClick={handleNextPage}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                            <button className={`btn ${projectDatasetView.nextPage === null ? 'btn-disabled' : ''}`} onClick={handleLastPage}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg></button>
                          </div>
                        </div>
                      </div>

                    <div className="overflow-x-auto relative shadow-xl rounded-xl">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-base-300">
                        <tr>
                          {Object.keys(projectDatasetView.dataset[0]).map((colKey, colIndex) => {
                            return (
                              <th key={colIndex} scope="col" className="py-5 px-6 md:px-8">
                                {colKey}
                              </th>
                            );
                          })}
                        </tr>
                        </thead>
                        <tbody>
                          {Object.values(projectDatasetView.dataset).map((rowValue, rowIndex) => {
                            return(
                              <tr className="bg-base-200 hover:bg-base-100" key={rowIndex}>
                                {Object.keys(rowValue).map((colKey, colIndex) => {
                                  return (
                                    <td className="py-5 px-6 md:px-8" key={colIndex}>
                                      {rowValue[colKey]}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    </div>
                  ) : (
                    <div className={'my-20'}>
                      <h1 className={'text-2xl font-bold my-4'}>No data in dataset</h1>
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