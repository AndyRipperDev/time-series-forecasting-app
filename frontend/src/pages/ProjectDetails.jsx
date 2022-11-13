import { useEffect } from 'react'
import { useRecoilValue } from 'recoil'

import { authAtom, projectAtom } from 'state'
import { Link, useParams } from 'react-router-dom'
import { useProjectService } from '../services/project.service'
import LoadingPage from '../components/Loadings/LoadingPage'
import TextHeading from '../components/TextHeading'
import { history } from '../helpers'

const ProjectDetailsPage = () => {
  const { id } = useParams()
  const projectService = useProjectService()
  const project = useRecoilValue(projectAtom)

  useEffect(() => {
    projectService.getById(id)
  }, [])


  function handleDownload(event) {
    projectService.downloadDataset(project)
  }

  function handleDelete(event) {
    projectService.delete(project.id).then((response) => {
      history.navigate(`/projects`)
    })
  }

  const loading = !project

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
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectDetailsPage
