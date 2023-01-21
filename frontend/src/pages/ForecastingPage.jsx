import { useForecastService } from '../services/forecast.service'
import { useRecoilValue } from 'recoil'
import { forecastingResultsAtom } from '../state'
import { useEffect } from 'react'
import Loading from '../components/Loadings/Loading'
import LoadingPage from '../components/Loadings/LoadingPage'

const ForecastingPage = () => {
  const forecastService = useForecastService()
  const forecastingResults = useRecoilValue(forecastingResultsAtom)

  useEffect(() => {
    forecastService.getForecastingResults()

    return () => {
      forecastService.resetForecastingResults()
    }
  }, []);

  const getBadge = (status) => {
    if (status == 'Ready') {
      return 'badge-info'
    } else if (status == 'Finished') {
      return 'badge-success'
    }

    return 'badge-warning'
  }

  const loading = !forecastingResults

  return (
    <div>
      {loading ? (
        <LoadingPage />
      ) : (
        <div>
          {forecastingResults && (
            <div>
              {Object.keys(forecastingResults.forecasting).map(
                (key, index, { length }) => {
                  return (
                    <div key={key}>
                      <p>{forecastingResults.forecasting[key][Object.keys(forecastingResults.forecasting[key])[0]][0].datasetcolumns.datasets.project.title}</p>
                      {Object.keys(forecastingResults.forecasting[key]).map(
                        (key2, index2, { length2 }) => {
                          return (
                            <div key={key2}>
                              <p>{forecastingResults.forecasting[key][key2][0].datasetcolumns.name}</p>
                              <div className="overflow-x-auto relative shadow-xl rounded-xl">
                                <table className="w-full text-sm text-left">
                                  <thead className="text-xs uppercase bg-base-300">
                                  <tr>
                                    <th scope="col" className="py-5 px-6 md:px-8">
                                      Model
                                    </th>
                                    <th scope="col" className="py-5 px-6 md:px-8">
                                      Split ratio
                                    </th>
                                    <th scope="col" className="py-5 px-6 md:px-8">
                                      Started
                                    </th>
                                    <th scope="col" className="py-5 px-6 md:px-8">
                                      Finished
                                    </th>
                                    <th scope="col" className="py-5 px-6 md:px-8">
                                      Status
                                    </th>
                                  </tr>
                                  </thead>
                                  <tbody>
                                  {forecastingResults.forecasting[key][key2].map((forecast) => (
                                    <tr
                                      className="bg-base-200 hover:bg-base-100"
                                      key={forecast.id}
                                    >
                                      <th scope="row" className="py-5 px-6 md:px-8 font-medium">
                                        {forecast.model}
                                      </th>
                                      <td className="py-5 px-6 md:px-8">
                                        {forecast.split_ratio} : {100 - forecast.split_ratio}
                                      </td>
                                      <td className="py-5 px-6 md:px-8">
                                        {new Date(forecast.created_at).toLocaleString()}
                                      </td>
                                      <td className="py-5 px-6 md:px-8">
                                        {forecast.updated_at && (
                                          new Date(forecast.updated_at).toLocaleString()
                                        )}
                                      </td>
                                      <td className="py-5 px-6 md:px-8">
                                        <div className={`badge ${getBadge(forecast.status)}`}>
                                          {forecast.status}
                                        </div>
                                      </td>
                                    </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )})}
                    </div>
                  )}
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ForecastingPage
