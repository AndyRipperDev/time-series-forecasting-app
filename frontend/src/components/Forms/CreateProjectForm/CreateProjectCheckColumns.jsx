import { useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

import { authAtom, projectAtom } from 'state'
import { Link, useParams } from 'react-router-dom'
import { useProjectService } from '../../../services/project.service'
import LoadingPage from '../../Loadings/LoadingPage'

const CreateProjectCheckColumns = () => {
  const { id } = useParams()
  const projectService = useProjectService()
  const [project, setProject] = useRecoilState(projectAtom)
  const auth = useRecoilValue(authAtom)

  useEffect(() => {
    projectService.getById2(id)
  }, [])

  const handleDataTypeChange = (event, id) => {
    let newCols = [...project.dataset.columns].map((column) => {
      if (column.id === id) return { ...column, data_type: event.target.value };
      else return column;
    });

    let newProject = {
      description: project.description,
      title: project.title,
      id: project.id,
      user_id: project.user_id,
      dataset: {
        delimiter: project.dataset.delimiter,
        filename: project.dataset.filename,
        filename_processed: project.dataset.filename_processed,
        project_id: project.dataset.project_id,
        id: project.dataset.id,
        columns: newCols
      }
    }

    console.log(newProject)
    setProject(newProject);
  }

  function handleSubmit(event) {
    alert('Submitted');
    event.preventDefault();
    projectService.update_cols(project.dataset.id, project.dataset.columns)
  }

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
            <form onSubmit={handleSubmit}>
              <div className="overflow-x-auto relative shadow-xl rounded-xl bg-base-200">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-base-300">
                    <tr>
                      <th scope="col" className="py-5 px-6 md:px-8">
                        Column
                      </th>
                      <th scope="col" className="py-5 px-6 md:px-8">
                        Data Type
                      </th>
                      {/*<th scope="col" className="py-5 px-6 md:px-8">*/}
                      {/*  Data Type Change*/}
                      {/*</th>*/}
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
                        {/*<td className="py-5 px-6 md:px-8">{column.data_type}</td>*/}
                        <td className="py-5 px-6 md:px-8">
                          <select className="select select-bordered w-full max-w-xs" value={column.data_type} onChange={(e) => handleDataTypeChange(e, column.id)}>
                            <option value="object">object</option>
                            <option value="int64">int64</option>
                            <option value="float64">float64</option>
                            <option value="bool">bool</option>
                            <option value="datetime64">datetime64</option>
                            <option value="timedelta[ns]">timedelta[ns]</option>
                            <option value="category">category</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <input type="submit" value="Confirm" className="btn btn-primary mt-8 mb-4" />
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default CreateProjectCheckColumns
