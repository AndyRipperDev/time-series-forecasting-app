import { useEffect } from 'react'
import { useRecoilValue } from 'recoil'

import { authAtom, forecastingResultsRecentAtom, projectStatsAtom } from 'state'
import { useUserService } from '../../services'
import { Link } from 'react-router-dom'
import CreateProjectIcon from '../../components/SVG/Path/CRUD/CreateProjectIcon'
import { useForecastService } from '../../services/forecast.service'
import { useProjectService } from '../../services/project.service'
import ViewIcon from '../../components/SVG/Path/CRUD/ViewIcon'
import DeleteIcon from '../../components/SVG/Path/CRUD/DeleteIcon'
import Loading from '../../components/Loadings/Loading'

const HomePage = () => {
  const forecastService = useForecastService()
  const projectService = useProjectService()
  const projectStats = useRecoilValue(projectStatsAtom)
  const forecastingResultsRecent = useRecoilValue(forecastingResultsRecentAtom)
  const auth = useRecoilValue(authAtom)

  useEffect(() => {
    projectService.getProjectStats()
    forecastService.getForecastingResultsRecent()

    return () => {
      projectService.resetProjectStats()
      forecastService.resetForecastingResultsRecent()
    }
  }, [])

  const getBadge = (status) => {
    if (status === 'Ready') {
      return 'badge-info'
    } else if (status === 'Finished') {
      return 'badge-success'
    } else if (status === 'Failed') {
      return 'badge-error'
    }
    return 'badge-warning'
  }

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="font-bold text-3xl mb-8">
        Welcome back {auth?.user?.full_name}
      </h1>
      <Link to="/projects/add" className="btn btn-active btn-primary gap-4">
        <CreateProjectIcon size={6}/>
        Create New Project
      </Link>

      {projectStats && (
        <>
          <div className="stats stats-vertical lg:stats-horizontal text-center shadow-lg bg-base-200 mt-16 mb-10">
            <div className="stat">
              <div className="stat-title">Project Count</div>
              <div className="stat-value">
                {projectStats?.project_count}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Forecast Count</div>
              <div className="stat-value">
                {projectStats?.forecast_count}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Last Week's Forecasts</div>
              <div className="stat-value">
                {projectStats?.forecast_count_last_week}
              </div>
            </div>
          </div>

          {projectStats?.forecast_count !== 0 && (
            <>
              {!forecastingResultsRecent ? (
                <div className="place-items-center text-center py-24">
                  <h1 className="text-2xl font-bold text-center mb-12">
                    Loading Recent Forecasts
                  </h1>
                  <Loading />
                </div>
              ) : (
                <div className="overflow-x-auto relative shadow-lg rounded-xl mb-2">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-base-300">
                      <tr>
                        <th
                          scope="col"
                          className="py-5 px-4 lg:px-8"
                        >
                          Project
                        </th>
                        <th
                          scope="col"
                          className="py-5 px-2 lg:px-8"
                        >
                          Column
                        </th>
                        <th
                          scope="col"
                          className="py-5 px-2 lg:px-8"
                        >
                          Model
                        </th>
                        <th
                          scope="col"
                          className="py-5 px-2 lg:px-8"
                        >
                          Forecast horizon
                        </th>
                        <th
                          scope="col"
                          className="py-5 px-2 lg:px-8"
                        >
                          Started
                        </th>
                        <th
                          scope="col"
                          className="py-5 px-2 lg:px-8"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="py-5 px-4 lg:px-8"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                    {forecastingResultsRecent.map((forecast) => (
                      <tr
                        className="bg-base-200 hover:bg-base-100"
                        key={forecast.id}
                      >
                        <th
                          scope="row"
                          className="py-5 px-4 lg:px-8 font-medium"
                        >
                          {forecast?.datasetcolumns?.datasets?.project?.title}
                        </th>
                        <td className="py-5 px-2 lg:px-8">
                          {forecast?.datasetcolumns?.name}
                        </td>
                        <td className="py-5 px-2 lg:px-8">
                          {forecast.model}
                        </td>
                        <td className="py-5 px-2 lg:px-8">
                          {forecast.forecast_horizon}
                        </td>
                        <td className="py-5 px-2 lg:px-8">
                          {new Date(
                            forecast.created_at
                          ).toLocaleString()}
                        </td>

                        <td className="py-5 px-2 lg:px-8">
                          <div
                            className={`badge ${getBadge(
                              forecast.status
                            )}`}
                          >
                            {forecast.status}
                          </div>
                        </td>
                        <td className="py-2 px-4 lg:px-8">
                          <Link
                            to={`/forecasting/${forecast.id}`}
                            className="btn gap-2 hover:text-info"
                          >
                            <ViewIcon size={5}/>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default HomePage
