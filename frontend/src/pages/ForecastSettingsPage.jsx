import { useParams } from 'react-router-dom'
import { useRecoilValue, useRecoilState } from 'recoil'
import {
  projectDatasetColumnsAtom,
  themeAtom,
  projectDatasetColumnsViewAtom,
  forecastingModelsAtom,
  forecastingModelAtom,
  modelParamsAtom,
  projectTimePeriodAtom,
  createdForecastingAtom
} from '../state'
import { useEffect, useState } from 'react'
import { useProjectService } from '../services/project.service'
import LoadingPage from '../components/Loadings/LoadingPage'
import Plot from 'react-plotly.js'
import daisyuiColors from 'daisyui/src/colors/themes'
import { useForecastService } from '../services/forecast.service'
import ParamSettingItem from '../components/ParamSettingItem'
import ParamHeading from '../components/ParamHeading'
import ParamSubheading from '../components/ParamSubheading'
import FormInput from '../components/FormInput'
import { history } from '../helpers'

const ForecastSettingsPage = () => {
  const { id } = useParams()
  const [loadingColView, setLoadingColView] = useState(false)
  const projectService = useProjectService()
  const forecastService = useForecastService()
  const [forecastingModel, setForecastingModel] =
    useRecoilState(forecastingModelAtom)
  const [modelParams, setModelParams] = useRecoilState(modelParamsAtom)
  const theme = useRecoilValue(themeAtom)
  const projectTimePeriod = useRecoilValue(projectTimePeriodAtom)
  const projectDatasetColumns = useRecoilValue(projectDatasetColumnsAtom)
  const forecastingModels = useRecoilValue(forecastingModelsAtom)
  const createdForecasting = useRecoilValue(createdForecastingAtom)
  const projectDatasetColumnsView = useRecoilValue(projectDatasetColumnsViewAtom)

  const [splitValueRange, setSplitValueRange] = useState(80)
  const [splitDataValue, setSplitDataValue] = useState(0)
  const [selectedColumnName, setSelectedColumnName] = useState('')

  useEffect(() => {
    projectService.getDatasetColumns(id)
    projectService.getProjectTimePeriod(id)
    forecastService.getAllModels()

    return () => {
      projectService.resetDatasetColumns()
      projectService.resetProjectTimePeriod()
      projectService.resetDatasetColumnsView()
      forecastService.resetForecastingModels()
      forecastService.resetForecastingModel()
      forecastService.resetCreatedForecasting()
    }
  }, [])

  useEffect(() => {
    if (projectDatasetColumnsView) {
      setSplitValueRange(80)
      splitData(80)
    }
  }, [projectDatasetColumnsView])

  useEffect(() => {
    if(createdForecasting !== null) {
      history.navigate(`/forecasting/${createdForecasting.id}`)
    }
  }, [createdForecasting])

  function setColumnsView(column) {
    setLoadingColView(true)
    setSelectedColumnName(column)
    projectService.resetDatasetColumnsView()
    projectService.getDatasetColumnValues(id, 0, 0, column, true).then(() => {
      window.dispatchEvent(new Event('resize'))
      setLoadingColView(false)
    })
  }

  function handleSelectedColumnChange(e) {
    setColumnsView(e.target.value)
  }

  function handleSelectedForecastingModelChange(e) {
    let model = e.target.value
    setForecastingModel(model)

    let newModelParams = {
      autoTune: false,
      autoTuneParams: {
        bruteForce: false,
        tuneLevel: 1,
      },
      preprocessing: {
        useLog: false,
        useDecompose: false,
      },
      params: {},
      forecastHorizon: 1,
    }

    if (model.toUpperCase() === 'ARIMA') {
      newModelParams.params = {
        p: 1,
        d: 0,
        q: 1,
      }
    } else if (model.toUpperCase() === 'SARIMA') {
      newModelParams.params = {
        p: 1,
        d: 0,
        q: 1,
        P: 1,
        D: 0,
        Q: 1,
        m: 12,
      }
    }

    setModelParams(newModelParams)
  }

  function splitData(percentValue) {
    let splitValue = Math.round(
      (projectDatasetColumnsView.values_count * percentValue) / 100
    )
    setSplitDataValue(splitValue)
  }

  function handleSplitRangeChange(e) {
    let percentValue = e.target.value
    setSplitValueRange(percentValue)
    splitData(percentValue)
    // window.dispatchEvent(new Event('resize'))
  }

  const handleAutoTuneChange = (event) => {
    let model = { ...modelParams }
    model.autoTune = !model.autoTune
    setModelParams(model)
  }

  const handleUseLogChange = (event) => {
    let model = { ...modelParams }
    let preprocessing = { ...model.preprocessing }
    preprocessing.useLog = !preprocessing.useLog
    model.preprocessing = preprocessing
    setModelParams(model)
  }

  const handleDecompositionChange = (event) => {
    let model = { ...modelParams }
    let preprocessing = { ...model.preprocessing }
    preprocessing.useDecompose = !preprocessing.useDecompose
    model.preprocessing = preprocessing
    setModelParams(model)
  }

  const handleNumberParamChange = (event, paramName) => {
    let paramValue = Number(event.target.value)
    let model = { ...modelParams }
    let params = { ...model.params }

    params[paramName] = paramValue

    model.params = params
    setModelParams(model)
  }

  const handleForecastHorizonChange = (event) => {
    let model = { ...modelParams }
    model.forecastHorizon = Number(event.target.value)
    setModelParams(model)
  }

  const handleAutoTuneMethodChange = (event) => {
    let model = { ...modelParams }
    let autoTuneParams = { ...model.autoTuneParams }
    autoTuneParams.bruteForce = (event.target.value === 'true')
    model.autoTuneParams = autoTuneParams
    setModelParams(model)
  }

  const handleAutoTuneLevelChange = (event) => {
    let model = { ...modelParams }
    let autoTuneParams = { ...model.autoTuneParams }
    autoTuneParams.tuneLevel = Number(event.target.value)
    model.autoTuneParams = autoTuneParams
    setModelParams(model)
  }

  const getTuneLevelInfo = () => {
    if (modelParams.autoTuneParams.tuneLevel == 2) {
      return 'Slower - Sometimes may or may not give the best parameters'
    } else if (modelParams.autoTuneParams.tuneLevel == 3) {
      return 'Slow - Gives the best parameters'
    }

    return 'Fast - May not give the best parameters'
  }


  const handleForecastStart = (event) => {
    forecastService.create(id, selectedColumnName, forecastingModel, splitValueRange, modelParams)
  }


  const loading = !projectDatasetColumns
  // const loadingColView = !projectDatasetColumnsView
  return (
    <div className={'my-12'}>
      {loading ? (
        <LoadingPage />
      ) : (
        <div className={'w-full'}>
          {projectDatasetColumns && (
            <div
              className={
                'flex flex-col items-center mx-auto w-5/6 md:w-2/3 max-w-6xl space-y-4 mb-6'
              }
            >
              <h1 className={'text-3xl font-bold text-center mb-20'}>
                Forecast Settings
              </h1>

              <ParamHeading>Choose Data</ParamHeading>
              <ParamSettingItem title="Select Column">
                <select
                  className="select select-bordered w-full"
                  onChange={(e) => handleSelectedColumnChange(e)}
                >
                  <option
                    value=""
                    disabled={projectDatasetColumnsView !== null}
                  >
                    --Please choose a column--
                  </option>
                  {projectDatasetColumns.map(
                    (column) =>
                      !column.is_date && (
                        <option key={column.id} value={column.name}>
                          {column.name}
                        </option>
                      )
                  )}
                </select>
              </ParamSettingItem>

              {loadingColView ? (
                <LoadingPage />
              ) : (
                <div className={'w-full'}>
                  {projectDatasetColumnsView && (
                    <div>
                      <ParamHeading>Split Data</ParamHeading>
                      <div className=" bg-base-200 rounded-2xl shadow-xl my-4 p-5">
                        <Plot
                          className={'w-full h-full'}
                          data={[
                            {
                              y: Object.values(
                                projectDatasetColumnsView?.dataset
                              )[0].values.slice(0, splitDataValue + 1),
                              x: Object.values(
                                projectDatasetColumnsView?.dataset
                              )[1].values.slice(0, splitDataValue + 1),
                              type: 'scatter',
                              mode: 'lines',
                              name: 'Training Data',
                              marker: {
                                color:
                                  daisyuiColors[`[data-theme=${theme}]`][
                                    'primary'
                                  ],
                              },
                            },
                            {
                              y: Object.values(
                                projectDatasetColumnsView?.dataset
                              )[0].values.slice(splitDataValue),
                              x: Object.values(
                                projectDatasetColumnsView?.dataset
                              )[1].values.slice(splitDataValue),
                              type: 'scatter',
                              mode: 'lines',
                              name: 'Test Data',
                              marker: {
                                color:
                                  daisyuiColors[`[data-theme=${theme}]`][
                                    'secondary'
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

                      <div
                        className={
                          'w-full bg-base-200 py-4 px-6 rounded-2xl shadow-xl mt-6'
                        }
                      >
                        <label htmlFor="" className={'font-bold text-lg'}>
                          Split Ratio
                        </label>
                        <div className="badge ml-4">
                          {splitValueRange} : {100 - splitValueRange}
                        </div>
                        <div
                          className={'flex space-x-4 mb-6 mt-2 items-center'}
                        >
                          <div className="badge">0</div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={splitValueRange}
                            onChange={handleSplitRangeChange}
                            className="range range-primary"
                          />
                          <div className="badge">100</div>
                        </div>
                      </div>

                      <ParamHeading>Set Model</ParamHeading>
                      <div className={'w-full'}>
                        {forecastingModels && (
                          <ParamSettingItem title="Select Forecasting Model">
                            <select
                              className="select select-bordered w-full"
                              onChange={(e) =>
                                handleSelectedForecastingModelChange(e)
                              }
                            >
                              <option
                                value=""
                                disabled={forecastingModel !== null}
                              >
                                --Please choose a model--
                              </option>
                              {forecastingModels.models.map((model) => (
                                <option key={model} value={model}>
                                  {model}
                                </option>
                              ))}
                            </select>
                          </ParamSettingItem>
                        )}
                      </div>

                      {forecastingModel && modelParams && (
                        <div className={'w-full'}>
                          <ParamHeading>Set Parameters</ParamHeading>

                          <div className={'w-full'}>
                            <ParamSubheading firstParam={true}>
                              Preprocessing
                            </ParamSubheading>
                            <ParamSettingItem
                              title="Logarithmize"
                              inGroup={true}
                            >
                              <input
                                type={'checkbox'}
                                className={'checkbox checkbox-primary'}
                                checked={modelParams.preprocessing.useLog}
                                onChange={(e) => handleUseLogChange(e)}
                              />
                            </ParamSettingItem>
                            <ParamSettingItem
                              title="Use Decomposition"
                              inGroup={true}
                            >
                              <input
                                type={'checkbox'}
                                className={'checkbox checkbox-primary'}
                                checked={modelParams.preprocessing.useDecompose}
                                onChange={(e) => handleDecompositionChange(e)}
                              />
                            </ParamSettingItem>

                            <ParamSubheading>General Settings</ParamSubheading>
                            <ParamSettingItem
                              title="Forecast horizon"
                              inGroup={true}
                            >
                              <div className={'flex space-x-4 items-center'}>
                                <input
                                  type={'number'}
                                  min={1}
                                  className={
                                    'input input-bordered w-full max-w-xs'
                                  }
                                  value={modelParams.forecastHorizon}
                                  onChange={(e) =>
                                    handleForecastHorizonChange(e)
                                  }
                                />
                                <p className={'font-bold'}>
                                  {projectTimePeriod?.project_time_period?.unit}
                                </p>
                              </div>
                            </ParamSettingItem>
                            <ParamSettingItem title="Auto tune model">
                              <input
                                type={'checkbox'}
                                className={'checkbox checkbox-primary'}
                                checked={modelParams.autoTune}
                                onChange={(e) => handleAutoTuneChange(e)}
                              />
                            </ParamSettingItem>

                            {modelParams.autoTune ? (
                              <div>
                                <ParamSubheading>
                                  Auto Tune Settings
                                </ParamSubheading>
                                <ParamSettingItem title="Method" inGroup={true}>
                                  <select
                                    className="select select-bordered w-full"
                                    value={
                                      modelParams.autoTuneParams.bruteForce
                                    }
                                    onChange={(e) =>
                                      handleAutoTuneMethodChange(e)
                                    }
                                  >
                                    <option value={true}>Brute Force</option>
                                    <option value={false}>
                                      Hyperparameter Optimization
                                    </option>
                                  </select>
                                </ParamSettingItem>
                                <ParamSettingItem
                                  title="Level"
                                  info={getTuneLevelInfo()}
                                >
                                  <select
                                    className="select select-bordered w-full"
                                    value={modelParams.autoTuneParams.tuneLevel}
                                    onChange={(e) =>
                                      handleAutoTuneLevelChange(e)
                                    }
                                  >
                                    <option value={1}>Low</option>
                                    <option value={2}>Medium</option>
                                    <option value={3}>High</option>
                                  </select>
                                </ParamSettingItem>
                              </div>
                            ) : (
                              <div>
                                <ParamSubheading>
                                  Manual Parameter Settings
                                </ParamSubheading>

                                {Object.keys(modelParams.params).map(
                                  (key, index, { length }) => {
                                    return (
                                      <ParamSettingItem
                                        key={key}
                                        title={key}
                                        inGroup={length - 1 !== index}
                                      >
                                        <input
                                          type={'number'}
                                          min={0}
                                          max={
                                            key.toUpperCase() === 'D' ? 2 : null
                                          }
                                          className={
                                            'input input-bordered w-full max-w-xs'
                                          }
                                          value={modelParams.params[key]}
                                          onChange={(e) =>
                                            handleNumberParamChange(e, key)
                                          }
                                        />
                                      </ParamSettingItem>
                                    )
                                  }
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className={'w-full flex justify-center mt-24'}>
                        <button className="btn btn-primary btn-wide gap-3" onClick={handleForecastStart}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                          Forecast
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ForecastSettingsPage
