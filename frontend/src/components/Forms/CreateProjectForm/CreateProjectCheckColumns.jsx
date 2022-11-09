import { useEffect } from 'react'
import { useRecoilValue } from 'recoil'

import { authAtom, projectAtom } from 'state'
import { Link, useParams } from 'react-router-dom'
import { useProjectService } from '../../../services/project.service'
import LoadingPage from '../../Loadings/LoadingPage'

const CreateProjectCheckColumns = () => {
  const { id } = useParams()
  const projectService = useProjectService()
  const project = useRecoilValue(projectAtom)
  const auth = useRecoilValue(authAtom)

  useEffect(() => {
    projectService.getById2(id)
  }, [])

  const loading = !project
  console.log(project)
  return (
    <div>
      {loading ? (
        <LoadingPage />
      ) : (
        <div className="grid h-screen place-items-center text-center">
          <ul className="steps w-full md:w-2/3 lg:w-1/2">
            <li className="step step-primary">Create Project</li>
            <li className="step step-primary">Check Columns</li>
          </ul>
          {project && (
            <div className="overflow-x-auto relative shadow-xl rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-base-300">
                  <tr>
                    <th scope="col" className="py-5 px-6 md:px-8">
                      Column
                    </th>
                    <th scope="col" className="py-5 px-6 md:px-8">
                      Data Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {project.dataset.columns.map((column) => (
                    <tr
                      className="bg-base-200 hover:bg-base-100"
                      key={column.id}
                    >
                      <th
                        scope="row"
                        className="py-5 px-6 md:px-8 font-medium whitespace-nowrap"
                      >
                        {column.name}
                      </th>
                      <td className="py-5 px-6 md:px-8">{column.data_type}</td>
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

export default CreateProjectCheckColumns
