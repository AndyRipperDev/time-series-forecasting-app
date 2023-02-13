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
  createdForecastingAtom,
} from '../../state'
import { useEffect, useState } from 'react'
import { useProjectService } from '../../services/project.service'
import LoadingPage from '../../components/Loadings/LoadingPage'
import Plot from '../../../node_modules/react-plotly.js/react-plotly'
import daisyuiColors from 'daisyui/src/colors/themes'
import { useForecastService } from '../../services/forecast.service'
import ParamSettingItem from '../../components/ParamSettingItem'
import ParamHeading from '../../components/ParamHeading'
import ParamSubheading from '../../components/ParamSubheading'
import FormInput from '../../components/FormInput'
import { history } from '../../helpers'

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
  const projectDatasetColumnsView = useRecoilValue(
    projectDatasetColumnsViewAtom
  )

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
    if (createdForecasting !== null) {
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

    let newLaggedFeatures = []

    projectDatasetColumns.map((column) => {
      if (!column.is_date && column.name !== selectedColumnName) {
        let feature = {
          name: column.name,
          value: false,
        }
        newLaggedFeatures.push(feature)
      }
    })

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
      lagWindow: 3,
      laggedFeatures: newLaggedFeatures,
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
    } else if (model === 'LinearRegression') {
      newModelParams.params = {
        fit_intercept: true,
        copy_X: true,
        positive: false,
      }
    } else if (model === 'RandomForest') {
      newModelParams.params = {
        n_estimators: 100,
        criterion: 'squared_error',
        max_depth: -1,
        min_samples_split: 2,
        min_samples_leaf: 1,
        min_weight_fraction_leaf: 0.0,
        max_features: 'None',
        max_leaf_nodes: -1,
        min_impurity_decrease: 0.0,
        bootstrap: true,
        oob_score: false,
        verbose: 0,
        warm_start: false,
        ccp_alpha: 0.0,
        max_samples: -1,
      }
    } else if (model === 'XGBoost') {
      newModelParams.params = {
        n_estimators: 100,
        booster: 'gbtree',
        tree_method: 'auto',
        silent: 0,
        learning_rate: 0.3,
        min_child_weight: 1,
        max_depth: 6,
        gamma: 0,
        eval_metric: 'rmse',
        max_delta_step: 0,
        subsample: 1,
        colsample_bytree: 1,
        colsample_bylevel: 1,
        reg_lambda: 1,
        reg_alpha: 1,
        scale_pos_weight: 1,
        seed: 0,
      }
    } else if (model === 'LightGBM') {
      newModelParams.params = {
        boosting_type: 'gbdt',
        n_estimators: 100,
        reg_alpha: 0.0,
        reg_lambda: 0.0,
        colsample_bytree: 1.0,
        subsample: 200000,
        learning_rate: 0.1,
        max_depth: -1,
        num_leaves: 31,
        min_child_samples: 20,
        min_data_per_group: 100,
        cat_smooth: 10.0,
      }
    } else if (model === 'MLP') {
      newModelParams.params = {
        hidden_layer_sizes: '100',
        activation: 'relu',
        solver: 'adam',
        learning_rate: 'constant',
        alpha: 0.0001,
        learning_rate_init: 0.001,
        power_t: 0.5,
        max_iter: 200,
        shuffle: true,
        warm_start: false,
        momentum: 0.9,
        nesterovs_momentum: true,
        early_stopping: false,
        validation_fraction: 0.1,
        beta_1: 0.9,
        beta_2: 0.999,
        n_iter_no_change: 10,
        max_fun: 15000,
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

  const handleLagWindowChange = (event) => {
    let model = { ...modelParams }
    model.lagWindow = Number(event.target.value)
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
    autoTuneParams.bruteForce = event.target.value === 'true'
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

  const handleSelectParamChange = (event, paramName) => {
    let model = { ...modelParams }
    let params = { ...model.params }

    params[paramName] = event.target.value

    model.params = params
    setModelParams(model)
  }

  const handleBoolParamChange = (event, paramName) => {
    let model = { ...modelParams }
    let params = { ...model.params }

    params[paramName] = !params[paramName]

    model.params = params
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

  const getParamInfo = (param) => {
    if (param === 'hidden_layer_sizes') {
      return 'E.g. 100...or...100,4...or...20,8,3'
    }

    return null
  }

  const getLaggedFeaturesStr = () => {
    let features = ''
    modelParams.laggedFeatures.map((feature) => {
      if (feature.value) {
        features += feature.name + ';'
      }
    })

    if (features.slice(-1) === ';') {
      features = features.slice(0, -1)
    }

    return features.trim() === '' ? null : features
  }

  const getParamsForPost = () => {
    let model = { ...modelParams }
    let params = { ...model.params }

    Object.keys(params).map((key, index, { length }) => {
      if (isInt(params[key]) && params[key] === -1) {
        params[key] = null
      } else if (isString(params[key]) && params[key] === 'None') {
        params[key] = null
      }
    })

    return params
  }

  const handleForecastStart = (event) => {
    forecastService.create(
      id,
      selectedColumnName,
      forecastingModel,
      splitValueRange,
      modelParams,
      getParamsForPost(),
      getLaggedFeaturesStr()
    )
  }

  const handleLaggedFeatureChange = (event, featureName) => {
    let model = { ...modelParams }

    model.laggedFeatures = [...model.laggedFeatures].map((feature) => {
      if (feature.name === featureName)
        return { ...feature, value: !feature.value }
      else return feature
    })

    setModelParams(model)
  }

  const isInt = (val) => Number(val) === val && val % 1 === 0
  const isFloat = (val) => Number(val) === val && val % 1 !== 0
  const isBoolean = (val) => 'boolean' === typeof val
  const isString = (val) => typeof val === 'string' || val instanceof String

  function getSelectOptions(param) {
    if (forecastingModel === 'RandomForest') {
      if (param === 'criterion') {
        return (
          <>
            <option value={'squared_error'}>squared_error</option>
            <option value={'friedman_mse'}>friedman_mse</option>
            <option value={'absolute_error'}>absolute_error</option>
            <option value={'poisson'}>poisson</option>
          </>
        )
      } else if (param === 'max_features') {
        return (
          <>
            <option value={'None'}>None</option>
            <option value={'sqrt'}>sqrt</option>
            <option value={'log2'}>log2</option>
          </>
        )
      }
    } else if (forecastingModel === 'XGBoost') {
      if (param === 'booster') {
        return (
          <>
            <option value={'gbtree'}>gbtree</option>
            <option value={'gblinear'}>gblinear</option>
            <option value={'dart'}>dart</option>
          </>
        )
      } else if (param === 'tree_method') {
        return (
          <>
            <option value={'auto'}>auto</option>
            <option value={'exact'}>exact</option>
            <option value={'approx'}>approx</option>
            <option value={'hist'}>hist</option>
            <option value={'gpu_hist'}>gpu_hist</option>
          </>
        )
      } else if (param === 'eval_metric') {
        return (
          <>
            <option value={'rmse'}>rmse</option>
            <option value={'mae'}>mae</option>
            <option value={'logloss'}>logloss</option>
            <option value={'error'}>error</option>
            <option value={'merror'}>merror</option>
            <option value={'mlogloss'}>mlogloss</option>
            <option value={'auc'}>auc</option>
          </>
        )
      }
    } else if (forecastingModel === 'LightGBM') {
      if (param === 'boosting_type') {
        return (
          <>
            <option value={'gbdt'}>gbdt</option>
            <option value={'dart'}>dart</option>
          </>
        )
      }
    } else if (forecastingModel === 'MLP') {
      if (param === 'activation') {
        return (
          <>
            <option value={'relu'}>relu</option>
            <option value={'tanh'}>tanh</option>
            <option value={'logistic'}>logistic</option>
            <option value={'identity'}>identity</option>
          </>
        )
      } else if (param === 'solver') {
        return (
          <>
            <option value={'adam'}>adam</option>
            <option value={'sgd'}>sgd</option>
            <option value={'lbfgs'}>lbfgs</option>
          </>
        )
      } else if (param === 'learning_rate') {
        return (
          <>
            <option value={'constant'}>constant</option>
            <option value={'adaptive'}>adaptive</option>
            <option value={'invscaling'}>invscaling</option>
          </>
        )
      }
    }

    return null
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
                            legend: {
                              orientation: 'h',
                            },
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
                            {forecastingModel !== 'MLP' && (
                              <>
                                <ParamSubheading firstParam={true}>
                                  Preprocessing
                                </ParamSubheading>
                                <ParamSettingItem
                                  title="Log Transform"
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
                                    checked={
                                      modelParams.preprocessing.useDecompose
                                    }
                                    onChange={(e) => handleDecompositionChange(e)}
                                  />
                                </ParamSettingItem>
                              </>
                            )}
                            {forecastingModel?.toUpperCase() !== 'ARIMA' &&
                              forecastingModel?.toUpperCase() !== 'SARIMA' && (
                                <>
                                  <ParamSubheading>
                                    Feature Engineering
                                  </ParamSubheading>
                                  <ParamSettingItem
                                    title="Lag Window"
                                    inGroup={true}
                                  >
                                    <div
                                      className={'flex space-x-4 items-center'}
                                    >
                                      <input
                                        type={'number'}
                                        min={1}
                                        className={
                                          'input input-bordered w-full max-w-xs'
                                        }
                                        value={modelParams.lagWindow}
                                        onChange={(e) =>
                                          handleLagWindowChange(e)
                                        }
                                      />
                                      <p className={'font-bold'}>
                                        {
                                          projectTimePeriod?.project_time_period
                                            ?.unit
                                        }
                                        {modelParams.lagWindow > 1 && 's'}
                                      </p>
                                    </div>
                                  </ParamSettingItem>

                                  {modelParams?.laggedFeatures?.length !==
                                    0 && (
                                    <>
                                      <ParamSettingItem
                                        title="Lagged Features"
                                        inGroup={true}
                                      >
                                        <div className="dropdown dropdown-hover dropdown-bottom dropdown-end">
                                          <label
                                            tabIndex={0}
                                            className="btn m-1"
                                          >
                                            Select
                                          </label>
                                          <ul
                                            tabIndex={0}
                                            className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-52"
                                          >
                                            {modelParams.laggedFeatures?.map(
                                              (feature) =>
                                                !feature.value && (
                                                  <li key={feature.name}>
                                                    <button
                                                      onClick={(e) =>
                                                        handleLaggedFeatureChange(
                                                          e,
                                                          feature.name
                                                        )
                                                      }
                                                    >
                                                      {feature.name}
                                                    </button>
                                                  </li>
                                                )
                                            )}
                                          </ul>
                                        </div>
                                      </ParamSettingItem>
                                      <div
                                        className={'flex space-x-6 flex-wrap'}
                                      >
                                        {modelParams.laggedFeatures?.map(
                                          (feature) =>
                                            feature.value && (
                                              <div
                                                key={feature.name}
                                                className="badge badge-primary gap-4 rounded-xl py-6 my-2"
                                              >
                                                {feature.name}
                                                <button
                                                  className="btn btn-square btn-sm"
                                                  onClick={(e) =>
                                                    handleLaggedFeatureChange(
                                                      e,
                                                      feature.name
                                                    )
                                                  }
                                                >
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth="2"
                                                      d="M6 18L18 6M6 6l12 12"
                                                    />
                                                  </svg>
                                                </button>
                                              </div>
                                            )
                                        )}
                                      </div>
                                    </>
                                  )}
                                </>
                              )}

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
                                  {modelParams.forecastHorizon > 1 && 's'}
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
                                {(forecastingModel.toUpperCase() === 'ARIMA' ||
                                  forecastingModel.toUpperCase() ===
                                    'SARIMA') && (
                                  <ParamSettingItem
                                    title="Method"
                                    inGroup={true}
                                  >
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
                                )}
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
                                        info={getParamInfo(key)}
                                      >
                                        {isBoolean(modelParams.params[key]) && (
                                          <input
                                            type={'checkbox'}
                                            className={
                                              'checkbox checkbox-primary'
                                            }
                                            checked={modelParams.params[key]}
                                            onChange={(e) =>
                                              handleBoolParamChange(e, key)
                                            }
                                          />
                                        )}
                                        {isString(modelParams.params[key]) &&
                                          key !== 'hidden_layer_sizes' && (
                                            <select
                                              className="select select-bordered w-full"
                                              value={modelParams.params[key]}
                                              onChange={(e) =>
                                                handleSelectParamChange(e, key)
                                              }
                                            >
                                              {getSelectOptions(key)}
                                            </select>
                                          )}

                                        {(isInt(modelParams.params[key]) ||
                                          isFloat(modelParams.params[key])) && (
                                          <input
                                            type={'number'}
                                            min={-1}
                                            step={
                                              isInt(modelParams.params[key])
                                                ? 1
                                                : 0.01
                                            }
                                            max={
                                              key.toUpperCase() === 'D'
                                                ? 2
                                                : null
                                            }
                                            className={
                                              'input input-bordered w-full max-w-xs'
                                            }
                                            value={modelParams.params[key]}
                                            onChange={(e) =>
                                              handleNumberParamChange(e, key)
                                            }
                                          />
                                        )}
                                        {key === 'hidden_layer_sizes' && (
                                          <input
                                            type={'text'}
                                            className={
                                              'input input-bordered w-full max-w-xs'
                                            }
                                            value={modelParams.params[key]}
                                            onChange={(e) =>
                                              handleSelectParamChange(e, key)
                                            }
                                          />
                                        )}
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
                        <button
                          className="btn btn-primary btn-wide gap-3"
                          onClick={handleForecastStart}
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
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
