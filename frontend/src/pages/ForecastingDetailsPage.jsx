import { useParams } from 'react-router-dom'
import LoadingPage from '../components/Loadings/LoadingPage'
import { useEffect, useState } from 'react'
import { history } from '../helpers'
import { useForecastService } from '../services/forecast.service'
import { forecastingResultAtom} from '../state'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import Loading from '../components/Loadings/Loading'
import ParamSettingItem from '../components/ParamSettingItem'
import ParamSubheading from '../components/ParamSubheading'

const ForecastingDetailsPage = () => {
  const { id } = useParams()
  const forecastService = useForecastService()
  const forecastingResult = useRecoilValue(forecastingResultAtom)
  const [intervalId, setIntervalId] = useState(0);

  useEffect(() => {
    forecastService.getForecastingResult(id)
    const newIntervalId = setInterval(handleForecastCheck, 30000)
    setIntervalId(newIntervalId)

    return () => {
      forecastService.resetForecastingResult()
      clearInterval(newIntervalId)
      setIntervalId(0)
    }
  }, []);


  const handleForecastCheck = () => {
    forecastService.getForecastingResult(id)
  }


  if(forecastingResult?.status === 'Finished') {
    if(intervalId) {
      clearInterval(intervalId)
      setIntervalId(0)
    }
  }

  const loading = forecastingResult?.status !== 'Finished'

  return (
    <div className={'my-12'}>
      {loading ? (
          <div className="place-items-center text-center">
            <h1 className="text-3xl font-bold text-center mb-20">{forecastingResult?.status}</h1>
            <Loading />
          </div>
      ) : (
        <div className={'w-full'}>
          {forecastingResult && (
            <div className="mt-12 mx-auto max-w-screen-xl text-center">
              <h1 className="text-3xl font-bold md:text-4xl mb-12">
                {forecastingResult.datasetcolumns.name}
              </h1>
              <div className="stats stats-vertical lg:stats-horizontal shadow-lg bg-base-200">
                <div className="stat">
                  <div className="stat-title">Started</div>
                  <div className="stat-value text-3xl">{new Date(forecastingResult.created_at).toLocaleDateString()}</div>
                  <div className="stat-title text-xl mt-1">{new Date(forecastingResult.created_at).toLocaleTimeString()}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Finished</div>
                  <div className="stat-value text-3xl">{new Date(forecastingResult.updated_at).toLocaleDateString()}</div>
                  <div className="stat-title text-xl mt-1">{new Date(forecastingResult.updated_at).toLocaleTimeString()}</div>
                </div>
              </div>

              <h2 className={'text-2xl font-bold self-start mb-4 mt-16'}>Info</h2>
              <div className="stats stats-vertical lg:stats-horizontal shadow-lg bg-base-200">
                <div className="stat">
                  <div className="stat-title">Model</div>
                  <div className="stat-value">{forecastingResult.model}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Split Ratio</div>
                  <div className="stat-value">{forecastingResult.split_ratio} : {100 - forecastingResult.split_ratio}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Status</div>
                  <div className="stat-value">{forecastingResult.status}</div>
                </div>
              </div>

              <h2 className={'text-2xl font-bold self-start mb-4 mt-16'}>Parameters</h2>
              <div className="overflow-x-auto mx-10 md:mx-32 relative shadow-xl rounded-xl max-w-screen-xl">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-base-300">
                  <tr>
                    <th scope="col" className="py-5 px-6 md:px-8">Parameter</th>
                    <th scope="col" className="py-5 px-6 md:px-8">Value</th>
                  </tr>
                  </thead>
                  <tbody>
                  {Object.keys(forecastingResult.params).map(
                    (key, index, { length }) => {
                      return (
                        <tr className="bg-base-200 hover:bg-base-100" key={key}>
                          <td className="py-5 px-6 md:px-8">
                            {key}
                          </td>
                          <td className="py-5 px-6 md:px-8">
                            {forecastingResult.params[key]}
                          </td>
                        </tr>
                      )
                    }
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ForecastingDetailsPage
