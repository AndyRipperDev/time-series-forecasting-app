import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { projectsAtom } from '../../state'
import { Link } from 'react-router-dom'
import LoadingPage from '../../components/Loadings/LoadingPage'
import TextHeading from '../../components/TextHeading'
import { useProjectService } from '../../services/project.service'
import DeleteIcon from '../../components/SVG/Path/CRUD/DeleteIcon'
import ViewIcon from '../../components/SVG/Path/CRUD/ViewIcon'
import CreateProjectIcon from '../../components/SVG/Path/CRUD/CreateProjectIcon'
import EditIcon from '../../components/SVG/Path/CRUD/EditIcon'
import ViewColumnsIcon from '../../components/SVG/Path/General/ViewColumnsIcon'
import ForecastIcon from '../../components/SVG/Path/General/ForecastIcon'
import CheckColumnsIcon from '../../components/SVG/Path/General/CheckColumnsIcon'

const ProjectsPage = () => {
  const projectService = useProjectService()
  const projects = useRecoilValue(projectsAtom)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    projectService.getByAuthUser().then((response) => setLoading(false))
  }, [])

  return (
    <div>
      {isLoading ? (
        <LoadingPage />
      ) : (
        <div className="my-2 md:my-4 mx-4 md:mx-10">
          <div className={'flex justify-between'}>
            <h1 className="text-2xl font-bold md:text-3xl mt-6">Projects</h1>
            <Link to="/projects/add" className="btn hover:text-info gap-2 my-4">
              <CreateProjectIcon size={6}/>
              Create New Project
            </Link>
          </div>

          {projects && (
            <div className="overflow-x-auto relative shadow-xl rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-base-300">
                  <tr>
                    <th scope="col" className="py-5 px-6 md:px-8">
                      Title
                    </th>
                    <th scope="col" className="py-5 px-6 md:px-8">
                      Description
                    </th>
                    <th scope="col" className="py-5 px-6 md:px-8">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      className="bg-base-200 hover:bg-base-100"
                      key={project.id}
                    >
                      <th scope="row" className="py-5 px-6 md:px-8 font-medium">
                        {project.title}
                      </th>
                      <td className="py-5 px-6 md:px-8">
                        {project.description}
                      </td>
                      <td className="py-2 px-6 md:px-8">
                        <div
                          className={'flex flex-col md:flex-row items-center '}
                        >
                          <div className="btn-group mx-2 lg:mx-4 mb-2 md:mb-0">
                            <Link
                              to={`/projects/${project.id}`}
                              className="btn gap-2 hover:text-info"
                            >
                              <ViewIcon size={5}/>
                            </Link>
                            <Link
                              to={`/projects/${project.id}/columns-view`}
                              className={'btn gap-2 hover:text-info'}
                            >
                              <ViewColumnsIcon size={5}/>
                            </Link>
                            <Link
                              to={`/projects/${project.id}/forecast-settings`}
                              className={'btn gap-2 hover:text-info'}
                            >
                              <ForecastIcon size={5}/>
                            </Link>
                          </div>
                          <div className="btn-group mx-2 lg:mx-4">
                            <Link
                              to={`/projects/${project.id}/columns-check`}
                              className={'btn gap-2 hover:text-info'}
                            >
                              <CheckColumnsIcon size={5}/>
                            </Link>
                            <Link
                              to={`/projects/edit/${project.id}`}
                              className="btn gap-2 hover:text-info"
                            >
                              <EditIcon size={5}/>
                            </Link>

                            <button
                              onClick={() => projectService.delete(project.id)}
                              className={`btn ${
                                project.isDeleting ? 'loading' : ''
                              } gap-2 hover:text-error`}
                            >
                              {!project.isDeleting && (
                                <DeleteIcon size={5}/>
                              )}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectsPage
