import { useParams } from 'react-router-dom'
import LoadingPage from '../components/Loadings/LoadingPage'
import { useEffect, useState } from 'react'
import { history, useDateUtils } from '../helpers'
import { useForecastService } from '../services/forecast.service'
import {
  forecastingResultAtom,
  forecastingPredictedResultsAtom,
  forecastingPredictedTestResultsAtom,
  projectDatasetColumnsViewAtom, themeAtom,
} from '../state'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import Loading from '../components/Loadings/Loading'
import ParamSettingItem from '../components/ParamSettingItem'
import ParamSubheading from '../components/ParamSubheading'
import Plot from 'react-plotly.js'
import daisyuiColors from 'daisyui/src/colors/themes'
import { useProjectService } from '../services/project.service'

const ForecastingDetailsPage = () => {
  const { id } = useParams()
  const forecastService = useForecastService()
  const projectService = useProjectService()
  const dateUtils = useDateUtils()
  const theme = useRecoilValue(themeAtom)
  const forecastingResult = useRecoilValue(forecastingResultAtom)
  const forecastingPredictedResults = useRecoilValue(forecastingPredictedResultsAtom)
  const forecastingPredictedTestResults = useRecoilValue(forecastingPredictedTestResultsAtom)
  const projectDatasetColumnsView = useRecoilValue(projectDatasetColumnsViewAtom)

  const [intervalId, setIntervalId] = useState(0)

  useEffect(() => {
    forecastService.getForecastingResult(id)
    const newIntervalId = setInterval(handleForecastCheck, 30000)
    // const newIntervalId = setInterval(handleForecastCheck, 1000)
    setIntervalId(newIntervalId)

    return () => {
      forecastService.resetForecastingResult()
      projectService.resetDatasetColumnsView()
      forecastService.resetForecastingPredictedResults()
      forecastService.resetForecastingPredictedTestResults()
      handleClearInterval(newIntervalId)
      // clearInterval(newIntervalId)
      // setIntervalId(0)
    }
  }, []);


  function handleSetPlotView() {
    forecastService.getForecastingPredictedResults(id)
    forecastService.getForecastingPredictedTestResults(id)
    projectService.getDatasetColumnValues(forecastingResult.datasetcolumns.datasets.project.id, 0, 0, forecastingResult.datasetcolumns.name, true).then(() => {
      window.dispatchEvent(new Event('resize'))
    })
  }

  const handleClearInterval = (interval) => {
    clearInterval(interval)
    setIntervalId(0)
  }

  const handleForecastCheck = () => {
    forecastService.getForecastingResult(id)
  }

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


  if(forecastingResult?.status === 'Finished' || forecastingResult?.status === 'Failed') {
    if(intervalId) {
      handleClearInterval(intervalId)
      handleSetPlotView()
      // clearInterval(intervalId)
      // setIntervalId(0)
    }
  }

  const loading = forecastingResult?.status !== 'Finished' && forecastingResult?.status !== 'Failed'
  const loadingPlotView = !projectDatasetColumnsView || !forecastingPredictedTestResults || !forecastingPredictedResults

  return (
    <div>
      {loading ? (
        <div className="flex h-screen justify-center items-center">
          <div className={'flex flex-col items-center'}>
            <h1 className="text-3xl font-bold text-center mb-12">{forecastingResult?.status}</h1>
            <Loading />
          </div>
        </div>
      ) : (
        <div className={'w-full my-12'}>
          {forecastingResult && (
            <div className={'flex flex-col items-center mx-auto w-5/6 md:w-2/3 max-w-6xl space-y-4 mb-6' }>
             {/*<div className="flex flex-col mt-12 mx-auto max-w-screen-lg text-center">*/}
              <h1 className="text-3xl font-bold md:text-4xl mb-8">
                {forecastingResult.datasetcolumns.name}
              </h1>
              <div className={`badge badge-lg ${getBadge(forecastingResult.status)}`}>
                {forecastingResult.status}
              </div>
              <div className="pb-4">{dateUtils.getDateDiff(forecastingResult.created_at, forecastingResult.updated_at)}</div>


              <div className={'flex justify-center items-center space-x-6 pb-12'}>
                <div className={'flex flex-col space-y-1'}>
                  <p className={'font-bold'}>Started</p>
                  <div className={`badge badge-lg p-3.5`}>
                    {new Date(forecastingResult.created_at).toLocaleString()}
                  </div>
                </div>
                <div className={'flex flex-col space-y-1'}>
                <p className={'font-bold'}>Finished</p>
                  <div className={`badge badge-lg p-3.5`}>
                    {new Date(forecastingResult.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>



              {/*<div className="stats stats-vertical lg:stats-horizontal shadow-lg bg-base-200">*/}
              {/*  <div className="stat">*/}
              {/*    <div className="stat-title">Started</div>*/}
              {/*    <div className="stat-value text-3xl">{new Date(forecastingResult.created_at).toLocaleDateString()}</div>*/}
              {/*    <div className="stat-title text-xl mt-1">{new Date(forecastingResult.created_at).toLocaleTimeString()}</div>*/}
              {/*  </div>*/}
              {/*  <div className="stat">*/}
              {/*    <div className="stat-title">Finished</div>*/}
              {/*    <div className="stat-value text-3xl">{new Date(forecastingResult.updated_at).toLocaleDateString()}</div>*/}
              {/*    <div className="stat-title text-xl mt-1">{new Date(forecastingResult.updated_at).toLocaleTimeString()}</div>*/}
              {/*  </div>*/}
              {/*</div>*/}

              {/*<h2 className={'text-2xl font-bold self-start mb-4 mt-16'}>Info</h2>*/}
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
                  <div className="stat-title">Forecast Horizon</div>
                  <div className="stat-value">{forecastingResult.forecast_horizon}</div>
                </div>
                {/*<div className="stat">*/}
                {/*  <div className="stat-title">Elapsed Time</div>*/}
                {/*  <div className="stat-value">{dateUtils.getDateDiff(forecastingResult.created_at, forecastingResult.updated_at)}</div>*/}
                {/*</div>*/}
              </div>

              <div className="flex flex-col mt-12 mx-auto w-full text-center">
              {loadingPlotView ? (
                <div className="place-items-center text-center py-24">
                  <h1 className="text-2xl font-bold text-center mb-12">Loading Chart</h1>
                  <Loading />
                </div>
              ) : (
                <div className={'w-full'}>
                  {projectDatasetColumnsView && forecastingPredictedResults && forecastingPredictedTestResults && (
                    <div className=" bg-base-200 rounded-2xl shadow-xl my-4 p-5">
                      <Plot
                        className={'w-full h-full'}
                        data={[
                          {
                            y: Object.values(projectDatasetColumnsView?.dataset)[0].values,
                            x: Object.values(projectDatasetColumnsView?.dataset)[1].values,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Real Data',
                            marker: {
                              color:
                                daisyuiColors[`[data-theme=${theme}]`][
                                  'primary'
                                  ],
                            },
                          },
                          {
                            y: Object.values(forecastingPredictedTestResults?.results)[0],
                            x: Object.values(forecastingPredictedTestResults?.results)[1],
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Predicted Test Data',
                            marker: {
                              color:
                                daisyuiColors[`[data-theme=${theme}]`][
                                  'secondary'
                                  ],
                            },
                          },
                          {
                            y: Object.values(forecastingPredictedResults?.results)[0],
                            x: Object.values(forecastingPredictedResults?.results)[1],
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Predicted Forecast',
                            marker: {
                              color:
                                daisyuiColors[`[data-theme=${theme}]`][
                                  'accent'
                                  ],
                            },
                          },
                        ]}
                        layout={{
                          // width: '100%',
                          title: Object.keys(
                            projectDatasetColumnsView?.dataset
                          )[0],
                          font: {
                            color:
                              daisyuiColors[`[data-theme=${theme}]`][
                                'base-content'
                                ],
                          },
                          paper_bgcolor:
                            daisyuiColors[`[data-theme=${theme}]`][
                              'base-200'
                              ],
                          plot_bgcolor:
                            daisyuiColors[`[data-theme=${theme}]`][
                              'base-200'
                              ],
                          autosize: true,
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  )}
                </div>
                )}

              <h2 className={'text-2xl font-bold self-start mb-4 mt-16'}>Parameters</h2>
              <div className="overflow-x-auto relative shadow-xl rounded-xl max-w-screen-xl">
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ForecastingDetailsPage
