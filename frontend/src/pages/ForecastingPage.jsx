import { useForecastService } from '../services/forecast.service'
import { useRecoilValue } from 'recoil'
import { forecastingResultsAtom } from '../state'
import { useEffect } from 'react'
import Loading from '../components/Loadings/Loading'
import LoadingPage from '../components/Loadings/LoadingPage'
import { Link } from 'react-router-dom'
import { useDateUtils } from '../helpers/dateUtils'

const ForecastingPage = () => {
  const forecastService = useForecastService()
  const dateUtils = useDateUtils()
  const forecastingResults = useRecoilValue(forecastingResultsAtom)

  useEffect(() => {
    forecastService.getForecastingResults()

    return () => {
      forecastService.resetForecastingResults()
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

  const loading = !forecastingResults

  return (
    <div>
      {loading ? (
        <LoadingPage />
      ) : (
        <div className="my-2 md:my-4 mx-4 md:mx-10">
          <h1 className="text-2xl font-bold md:text-3xl mt-6 mb-4">
            Forecasts
          </h1>
          {forecastingResults && (
            <div>
              {Object.keys(forecastingResults.forecasting).map(
                (key, index, { length }) => {
                  return (
                    <div
                      key={key}
                      className="collapse collapse-arrow border border-base-100 bg-base-100 rounded-box"
                    >
                      <input type="checkbox" defaultChecked={true} />
                      <div className="collapse-title text-2xl md:text-3xl font-bold bg-base-100">
                        <div className={'flex justify-between items-center'}>
                          <div>
                            {
                              forecastingResults.forecasting[key][
                                Object.keys(
                                  forecastingResults.forecasting[key]
                                )[0]
                              ][0].datasetcolumns.datasets.project.title
                            }
                          </div>
                          <div className="badge badge-lg font-normal bg-base-200 border-base-200 text-base-content">
                            Project
                          </div>
                        </div>
                      </div>
                      <div className="collapse-content">
                        {Object.keys(forecastingResults.forecasting[key]).map(
                          (key2, index2, { length2 }) => {
                            return (
                              <div
                                key={key2}
                                className="collapse collapse-arrow border border-base-100 bg-base-100 rounded-box"
                              >
                                <input type="checkbox" defaultChecked={true} />
                                <div className="collapse-title text-xl font-medium ">
                                  <div
                                    className={
                                      'flex justify-between items-center'
                                    }
                                  >
                                    <div>
                                      {
                                        forecastingResults.forecasting[key][
                                          key2
                                        ][0].datasetcolumns.name
                                      }
                                    </div>
                                    <div className="badge badge-lg font-normal bg-base-200 border-base-200 text-base-content">
                                      Column
                                    </div>
                                  </div>
                                </div>
                                <div className="collapse-content">
                                  <div className="overflow-x-auto relative shadow-lg rounded-xl mb-2">
                                    <table className="w-full text-sm text-left">
                                      <thead className="text-xs uppercase bg-base-300">
                                        <tr>
                                          <th
                                            scope="col"
                                            className="py-5 px-6 md:px-8"
                                          >
                                            Model
                                          </th>
                                          <th
                                            scope="col"
                                            className="py-5 px-6 md:px-8"
                                          >
                                            Split ratio
                                          </th>
                                          <th
                                            scope="col"
                                            className="py-5 px-6 md:px-8"
                                          >
                                            Forecast horizon
                                          </th>
                                          <th
                                            scope="col"
                                            className="py-5 px-6 md:px-8"
                                          >
                                            Auto tune
                                          </th>
                                          <th
                                            scope="col"
                                            className="py-5 px-6 md:px-8"
                                          >
                                            Log Transform
                                          </th>
                                          <th
                                            scope="col"
                                            className="py-5 px-6 md:px-8"
                                          >
                                            Started
                                          </th>
                                          <th
                                            scope="col"
                                            className="py-5 px-6 md:px-8"
                                          >
                                            Finished
                                          </th>
                                          <th
                                            scope="col"
                                            className="py-5 px-6 md:px-8"
                                          >
                                            Elapsed Time
                                          </th>
                                          <th
                                            scope="col"
                                            className="py-5 px-6 md:px-8"
                                          >
                                            Status
                                          </th>
                                          <th
                                            scope="col"
                                            className="py-5 px-6 md:px-8"
                                          >
                                            Actions
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {forecastingResults.forecasting[key][
                                          key2
                                        ].map((forecast) => (
                                          <tr
                                            className="bg-base-200 hover:bg-base-100"
                                            key={forecast.id}
                                          >
                                            <th
                                              scope="row"
                                              className="py-5 px-6 md:px-8 font-medium"
                                            >
                                              {forecast.model}
                                            </th>
                                            <td className="py-5 px-6 md:px-8">
                                              {forecast.split_ratio} :{' '}
                                              {100 - forecast.split_ratio}
                                            </td>
                                            <td className="py-5 px-6 md:px-8">
                                              {forecast.forecast_horizon}
                                            </td>
                                            <td className="py-5 px-6 md:px-8">
                                              <input
                                                type="checkbox"
                                                className="checkbox"
                                                disabled
                                                checked={forecast.auto_tune}
                                              />
                                            </td>
                                            <td className="py-5 px-6 md:px-8">
                                              <input
                                                type="checkbox"
                                                className="checkbox"
                                                disabled
                                                checked={
                                                  forecast.use_log_transform
                                                }
                                              />
                                            </td>
                                            <td className="py-5 px-6 md:px-8">
                                              {new Date(
                                                forecast.created_at
                                              ).toLocaleString()}
                                            </td>
                                            <td className="py-5 px-6 md:px-8">
                                              {forecast.updated_at &&
                                                (forecast.status ===
                                                  'Finished' ||
                                                  forecast.status ===
                                                    'Failed') &&
                                                new Date(
                                                  forecast.updated_at
                                                ).toLocaleString()}
                                            </td>
                                            <td className="py-5 px-6 md:px-8">
                                              {forecast.updated_at &&
                                              (forecast.status === 'Finished' ||
                                                forecast.status === 'Failed')
                                                ? dateUtils.getDateDiff(
                                                    forecast.created_at,
                                                    forecast.updated_at
                                                  )
                                                : dateUtils.getDateDiff(
                                                    forecast.created_at,
                                                    new Date()
                                                  )}
                                            </td>
                                            <td className="py-5 px-6 md:px-8">
                                              <div
                                                className={`badge ${getBadge(
                                                  forecast.status
                                                )}`}
                                              >
                                                {forecast.status}
                                              </div>
                                            </td>
                                            <td className="py-2 px-6 md:px-8">
                                              <div
                                                className={
                                                  'flex flex-col md:flex-row items-center '
                                                }
                                              >
                                                <div className="btn-group mx-2 lg:mx-4 mb-2 md:mb-0">
                                                  <Link
                                                    to={`/forecasting/${forecast.id}`}
                                                    className="btn gap-2 hover:text-info"
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
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                      />
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                      />
                                                    </svg>
                                                  </Link>
                                                  <button
                                                    onClick={() => forecastService.delete(forecast.id, key, key2)}
                                                    className={`btn ${
                                                      forecast.isDeleting ? 'loading' : ''
                                                    } gap-2 hover:text-error`}
                                                  >
                                                    {!forecast.isDeleting && (
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
                                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                      </svg>
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
                                </div>
                              </div>
                            )
                          }
                        )}
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ForecastingPage
