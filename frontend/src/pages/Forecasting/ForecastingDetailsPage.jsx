import { useParams } from 'react-router-dom'
import {Fragment} from 'react'
import { useEffect, useState } from 'react'
import { useDateUtils } from '../../helpers'
import { useForecastService } from '../../services/forecast.service'
import {
  forecastingResultAtom,
  forecastingPredictedResultsAtom,
  forecastingPredictedTestResultsAtom,
  projectDatasetColumnsViewAtom,
  themeAtom, forecastingBaselineResultsAtom,
} from '../../state'
import { useRecoilValue } from 'recoil'
import Loading from '../../components/Loadings/Loading'
import Plot from '../../../node_modules/react-plotly.js/react-plotly'
import daisyuiColors from 'daisyui/src/colors/themes'
import { useProjectService } from '../../services/project.service'
import DownloadIcon from '../../components/SVG/Path/General/DownloadIcon'
import DocumentEmptyIcon from '../../components/SVG/Path/General/Documents/DocumentEmpyIcon'
import DocumentSearchIcon from '../../components/SVG/Path/General/Documents/DocumentSearchIcon'
import DocumentRowsIcon from '../../components/SVG/Path/General/Documents/DocumentRowsIcon'
import DocumentChartIcon from '../../components/SVG/Path/General/Documents/DocumentChartIcon'
import DocumentCopyIcon from '../../components/SVG/Path/General/Documents/DocumentCopyIcon'

const ForecastingDetailsPage = () => {
  const { id } = useParams()
  const forecastService = useForecastService()
  const projectService = useProjectService()
  const dateUtils = useDateUtils()
  const theme = useRecoilValue(themeAtom)
  const forecastingResult = useRecoilValue(forecastingResultAtom)
  const forecastingBaselineResults = useRecoilValue(forecastingBaselineResultsAtom)
  const forecastingPredictedResults = useRecoilValue(
    forecastingPredictedResultsAtom
  )
  const forecastingPredictedTestResults = useRecoilValue(
    forecastingPredictedTestResultsAtom
  )
  const projectDatasetColumnsView = useRecoilValue(
    projectDatasetColumnsViewAtom
  )

  const [intervalId, setIntervalId] = useState(0)

  useEffect(() => {
    forecastService.getForecastingResult(id)
    const newIntervalId = setInterval(handleForecastCheck, 30000)
    setIntervalId(newIntervalId)

    return () => {
      forecastService.resetForecastingResult()
      projectService.resetDatasetColumnsView()
      forecastService.resetForecastingBaselineResults()
      forecastService.resetForecastingPredictedResults()
      forecastService.resetForecastingPredictedTestResults()

      handleClearInterval(newIntervalId)
    }
  }, [])

  function handleSetPlotView() {
    forecastService.getForecastingBaselineResults(id)
    forecastService.getForecastingPredictedResults(id)
    forecastService.getForecastingPredictedTestResults(id)
    projectService
      .getDatasetColumnValues(
        forecastingResult.datasetcolumns.datasets.project.id,
        0,
        0,
        forecastingResult.datasetcolumns.name,
        true,
        false
      )
      .then(() => {
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

  const handleDownloadTest = (e) => {
    forecastService.downloadTestDataset(forecastingResult)
  }

  const handleDownloadBaselineTest = (e) => {
    forecastService.downloadBaselineTestDataset(forecastingResult)
  }

  const handleDownloadBaselineForecast = (e) => {
    forecastService.downloadBaselineForecastedDataset(forecastingResult)
  }

  const handleDownloadCombinedTest = (e) => {
    forecastService.downloadCombinedTestDataset(forecastingResult)
  }

  const handleDownloadForecast = (e) => {
    forecastService.downloadForecastedDataset(forecastingResult)
  }

  const handleDownloadReal = (e) => {
    projectService.downloadDataset(
      forecastingResult.datasetcolumns.datasets.project,
      forecastingResult.datasetcolumns.datasets.filename
    )
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

  const getLevel = (level) => {
    if (level === 1) {
      return 'Low'
    } else if (level === 2) {
      return 'Medium'
    } else if (level === 3) {
      return 'High'
    }
    return 'Unspecified'
  }

  const getYesNo = (value) => {
    return value ? 'Yes' : 'No'
  }

  const getParamValue = (value) => {
    if (value === null) {
      return 'None'
    } else if ('boolean' === typeof value && value) {
      return 'Yes'
    } else if ('boolean' === typeof value && !value) {
      return 'No'
    }

    return value
  }

  const getEvalMetricValue = (value) => {
    if (value) {
      return value
    }
    return 'None'
  }

  if (
    forecastingResult?.status === 'Finished' ||
    forecastingResult?.status === 'Failed'
  ) {
    if (intervalId) {
      handleClearInterval(intervalId)
      handleSetPlotView()
    }
  }

  const loading =
    forecastingResult?.status !== 'Finished' &&
    forecastingResult?.status !== 'Failed'
  const loadingPlotView =
    !projectDatasetColumnsView ||
    !forecastingPredictedTestResults ||
    !forecastingPredictedResults

  return (
    <div>
      {loading ? (
        <div className="flex h-screen justify-center items-center">
          <div className={'flex flex-col items-center'}>
            <h1 className="text-3xl font-bold text-center mb-12">
              {forecastingResult?.status}
            </h1>
            <Loading />
          </div>
        </div>
      ) : (
        <div className={'w-full my-12'}>
          {forecastingResult && (
            <div
              className={
                'flex flex-col items-center mx-auto w-5/6 md:w-2/3 max-w-6xl space-y-4 mb-6'
              }
            >
              <h1 className="text-3xl font-bold md:text-4xl mb-2">
                {forecastingResult.datasetcolumns.name}
              </h1>
              <div
                className={`badge badge-lg ${getBadge(
                  forecastingResult.status
                )}`}
              >
                {forecastingResult.status}
              </div>
              <div className="pb-4">
                {dateUtils.getDateDiff(
                  forecastingResult.created_at,
                  forecastingResult.updated_at
                )}
              </div>

              <div
                className={'flex justify-center items-center space-x-6 pb-12'}
              >
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

              <div className="stats stats-vertical lg:stats-horizontal shadow-lg bg-base-200">
                <div className="stat">
                  <div className="stat-title">Model</div>
                  <div className="stat-value">{forecastingResult.model}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Split Ratio</div>
                  <div className="stat-value">
                    {forecastingResult.split_ratio} :{' '}
                    {100 - forecastingResult.split_ratio}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title">Forecast Horizon</div>
                  <div className="stat-value">
                    {forecastingResult.forecast_horizon}
                  </div>
                  <div className="stat-desc">
                    {forecastingResult.datasetcolumns.datasets.time_period.unit}
                    {forecastingResult.forecast_horizon > 1 && 's'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col mx-auto w-full text-center">
                {loadingPlotView ? (
                  <div className="place-items-center text-center py-24">
                    <h1 className="text-2xl font-bold text-center mb-12">
                      Loading Chart
                    </h1>
                    <Loading />
                  </div>
                ) : (
                  <div className={'w-full mt-12'}>
                    <div className={'flex justify-end'}>
                      <div className="dropdown dropdown-hover dropdown-top dropdown-end">
                        <label tabIndex={0} className="btn mt-2 gap-4">
                          <DownloadIcon size={6}/>
                          Download Dataset
                        </label>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu p-2 shadow-lg bg-base-200 rounded-box w-60"
                        >
                          <li>
                            <button onClick={handleDownloadReal}>
                              <DocumentEmptyIcon size={5}/>
                              Real
                            </button>
                          </li>
                          {forecastingResult.status === 'Finished' && (
                            <>
                              <li>
                                <button onClick={handleDownloadTest}>
                                  <DocumentSearchIcon size={5}/>
                                  Forecasted Test
                                </button>
                              </li>
                              <li>
                                <button onClick={handleDownloadCombinedTest}>
                                  <DocumentRowsIcon size={5}/>
                                  Combined Test
                                </button>
                              </li>
                              <li>
                                <button onClick={handleDownloadBaselineTest}>
                                  <DocumentCopyIcon size={5}/>
                                  Baseline Test
                                </button>
                              </li>
                              <li>
                                <button onClick={handleDownloadBaselineForecast}>
                                  <DocumentCopyIcon size={5}/>
                                  Baseline Forecast
                                </button>
                              </li>
                              <li>
                                <button onClick={handleDownloadForecast}>
                                  <DocumentChartIcon size={5}/>
                                  Forecast
                                </button>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>

                    {projectDatasetColumnsView &&
                      forecastingPredictedResults &&
                      forecastingPredictedTestResults && (
                        <div className=" bg-base-200 rounded-2xl shadow-xl my-4 p-5">
                          <Plot
                            className={'w-full h-full'}
                            data={[
                              {
                                y: Object.values(
                                  projectDatasetColumnsView?.dataset
                                )[0].values,
                                x: Object.values(
                                  projectDatasetColumnsView?.dataset
                                )[1].values,
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
                                y: Object.values(
                                  forecastingPredictedTestResults?.results
                                )[0],
                                x: Object.values(
                                  forecastingPredictedTestResults?.results
                                )[1],
                                type: 'scatter',
                                mode: 'lines',
                                name: 'Forecasted Test Data',
                                marker: {
                                  color:
                                    daisyuiColors[`[data-theme=${theme}]`][
                                      'secondary'
                                    ],
                                },
                              },
                              {
                                y: Object.values(
                                  forecastingPredictedResults?.results
                                )[0],
                                x: Object.values(
                                  forecastingPredictedResults?.results
                                )[1],
                                type: 'scatter',
                                mode: 'lines',
                                name: 'Forecast',
                                marker: {
                                  color:
                                    daisyuiColors[`[data-theme=${theme}]`][
                                      'accent'
                                    ],
                                },
                              },
                              {
                                y: Object.values(
                                  forecastingBaselineResults?.results
                                )[0],
                                x: Object.values(
                                  forecastingBaselineResults?.results
                                )[1],
                                visible: 'legendonly',
                                type: 'scatter',
                                mode: 'lines',
                                name: 'Baseline Forecast',
                                marker: {
                                  color: '#3abff8'
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
                              legend: {
                                orientation: 'h',
                              },
                            }}
                            useResizeHandler={true}
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                      )}
                  </div>
                )}

                {forecastingResult.status === 'Finished' && forecastingResult?.evaluationmetrics && (
                  <>
                    {forecastingResult.evaluationmetrics.map((metric) => (
                      <Fragment key={metric.id}>
                        <h2 key={metric.id} className={'text-2xl font-bold self-start mb-4 mt-6'}>
                          {metric.type} Results
                        </h2>
                        <div className="stats stats-vertical lg:stats-horizontal text-left shadow-lg bg-base-200">
                          <div className="stat">
                            <div className="stat-title">MAE</div>
                            <div className="stat-value text-2xl">
                              {getEvalMetricValue(metric?.MAE)}
                            </div>
                          </div>
                          <div className="stat">
                            <div className="stat-title">MSE</div>
                            <div className="stat-value text-2xl">
                              {getEvalMetricValue(metric?.MSE)}
                            </div>
                          </div>
                          <div className="stat">
                            <div className="stat-title">MAPE</div>
                            <div className="stat-value text-2xl">
                              {getEvalMetricValue(metric?.MAPE)}
                            </div>
                          </div>
                          <div className="stat">
                            <div className="stat-title">SMAPE</div>
                            <div className="stat-value text-2xl">
                              {getEvalMetricValue(metric?.SMAPE)}
                            </div>
                          </div>
                          <div className="stat">
                            <div className="stat-title">R2</div>
                            <div className="stat-value text-2xl">
                              {getEvalMetricValue(metric?.R2)}
                            </div>
                          </div>
                          <div className="stat">
                            <div className="stat-title">WAPE</div>
                            <div className="stat-value text-2xl">
                              {getEvalMetricValue(metric?.WAPE)}
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    ))}
                  </>
                  )}

                <h2 className={'text-2xl font-bold self-start mb-4 mt-16'}>
                  Settings
                </h2>
                <div className="overflow-x-auto relative shadow-xl rounded-xl max-w-screen-xl">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-base-300">
                      <tr>
                        <th scope="col" className="py-5 px-6 md:px-8">
                          Setting
                        </th>
                        <th scope="col" className="py-5 px-6 md:px-8">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastingResult.model !== 'MLP' && (
                        <>
                          <tr className="bg-base-200 hover:bg-base-100">
                            <td className="py-5 px-6 md:px-8">Log Transform</td>
                            <td className="py-5 px-6 md:px-8">
                              {getYesNo(forecastingResult.use_log_transform)}
                            </td>
                          </tr>
                          <tr className="bg-base-200 hover:bg-base-100">
                            <td className="py-5 px-6 md:px-8">Decomposition</td>
                            <td className="py-5 px-6 md:px-8">
                              {getYesNo(forecastingResult.use_decomposition)}
                            </td>
                          </tr>
                        </>
                      )}
                      {forecastingResult.model !== 'ARIMA' && forecastingResult.model !== 'SARIMA' && (
                        <>
                          <tr className="bg-base-200 hover:bg-base-100">
                            <td className="py-5 px-6 md:px-8">Lag Window</td>
                            <td className="py-5 px-6 md:px-8">
                              {forecastingResult.lag_window}
                            </td>
                          </tr>
                          {forecastingResult.lagged_features && (
                            <tr className="bg-base-200 hover:bg-base-100">
                              <td className="py-5 px-6 md:px-8">Lagged Features</td>
                              <td className="py-5 px-6 md:px-8">
                                {forecastingResult.lagged_features}
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                      <tr className="bg-base-200 hover:bg-base-100">
                        <td className="py-5 px-6 md:px-8">Auto Tune</td>
                        <td className="py-5 px-6 md:px-8">
                          {getYesNo(forecastingResult.auto_tune)}
                        </td>
                      </tr>
                      {forecastingResult.auto_tune && (
                        <>
                          <tr className="bg-base-200 hover:bg-base-100">
                            <td className="py-5 px-6 md:px-8">
                              Auto Tune Method
                            </td>
                            <td className="py-5 px-6 md:px-8">
                              {forecastingResult.tune_brute_force ? (
                                <p>Brute Force</p>
                              ) : (
                                <p>Hyperparameter Optimization</p>
                              )}
                            </td>
                          </tr>
                          <tr className="bg-base-200 hover:bg-base-100">
                            <td className="py-5 px-6 md:px-8">
                              Auto Tune Level
                            </td>
                            <td className="py-5 px-6 md:px-8">
                              {getLevel(forecastingResult.tune_level)}
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                <h2 className={'text-2xl font-bold self-start mb-4 mt-16'}>
                  Parameters
                </h2>
                <div className="overflow-x-auto relative shadow-xl rounded-xl max-w-screen-xl">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-base-300">
                      <tr>
                        <th scope="col" className="py-5 px-6 md:px-8">
                          Parameter
                        </th>
                        <th scope="col" className="py-5 px-6 md:px-8">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(forecastingResult.params).map(
                        (key, index, { length }) => {
                          return (
                            <tr
                              className="bg-base-200 hover:bg-base-100"
                              key={key}
                            >
                              <td className="py-5 px-6 md:px-8">{key}</td>
                              <td className="py-5 px-6 md:px-8">
                                {getParamValue(forecastingResult.params[key])}
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
