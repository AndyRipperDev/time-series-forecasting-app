import { useEffect } from 'react'
import { useRecoilState } from 'recoil'

import { projectAtom } from 'state'
import { useParams } from 'react-router-dom'
import { useProjectService } from '../services/project.service'
import LoadingPage from '../components/Loadings/LoadingPage'
import { history } from '../helpers'

const ProjectCheckDatasetColumnsPage = () => {
  const { id } = useParams()
  const projectService = useProjectService()
  const [project, setProject] = useRecoilState(projectAtom)

  useEffect(() => {
    projectService.getById(id)

    return projectService.resetProject
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

    setProject(newProject);
  }

  const handleIsDateChange = (event, id) => {
    let newCols = [...project.dataset.columns].map((column) => {
      if (column.id === id) return { ...column, is_date: true };
      else return { ...column, is_date: false };
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

    setProject(newProject);
  }

  function handleSubmit(event) {
    event.preventDefault();
    projectService.updateDatasetColumns(project.dataset.id, project.dataset.columns).then(() => {
      history.navigate(`/projects/${project.id}`)
    })
  }

  const loading = !project
  return (
    <div>
      {loading ? (
        <LoadingPage />
      ) : (
        <div className="grid place-items-center text-center">
          <ul className="steps w-full md:w-2/3 lg:w-1/2 mb-20 mt-12">
            <li className="step step-primary font-semibold">Fill Project Data</li>
            <li className="step step-primary font-semibold">Check Dataset Columns</li>
          </ul>
          {project && (
            <form onSubmit={handleSubmit}>
              <h1 className={'text-center text-2xl font-bold mb-6'}>Check Dataset Columns</h1>
              <div className="overflow-x-auto relative shadow-xl rounded-xl bg-base-200 mb-20">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-base-300">
                    <tr>
                      <th scope="col" className="py-5 px-6 md:px-8">
                        Column
                      </th>
                      <th scope="col" className="py-5 px-6 md:px-8">
                        Data Type
                      </th>
                      <th scope="col" className="py-5 px-6 md:px-8">
                        Is Date
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
                        <td className="py-5 px-6 md:px-8">
                          <input
                            type={'checkbox'}
                            className={'checkbox checkbox-primary'}
                            checked={column.is_date}
                            onChange={(e) => handleIsDateChange(e, column.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <input type="submit" value="Save" className="btn w-5/6 btn-primary mt-8 mb-6" />
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectCheckDatasetColumnsPage
