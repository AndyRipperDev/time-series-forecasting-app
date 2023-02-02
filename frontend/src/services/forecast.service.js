import { useSetRecoilState, useRecoilState, useResetRecoilState } from 'recoil'

import { useAxiosWrapper } from '../helpers'
import {
  forecastingModelsAtom,
  forecastingModelAtom,
  modelParamsAtom,
  forecastingStatusAtom,
  createdForecastingAtom,
  forecastingResultAtom,
  forecastingResultsAtom,
  forecastingPredictedResultsAtom,
  forecastingPredictedTestResultsAtom,
} from '../state'

export { useForecastService }

function useForecastService() {
  const urlPartForecast = '/forecast'
  const setForecastingModels = useSetRecoilState(forecastingModelsAtom)
  const setForecastingModel = useSetRecoilState(forecastingModelAtom)
  const setForecastingStatus = useSetRecoilState(forecastingStatusAtom)
  const setForecastingResult = useSetRecoilState(forecastingResultAtom)
  const setForecastingResults = useSetRecoilState(forecastingResultsAtom)
  const setForecastingPredictedResults = useSetRecoilState(
    forecastingPredictedResultsAtom
  )
  const setForecastingPredictedTestResults = useSetRecoilState(
    forecastingPredictedTestResultsAtom
  )
  const setModelParams = useSetRecoilState(modelParamsAtom)
  const setCreatedForecasting = useSetRecoilState(createdForecastingAtom)
  const forecastApi = useAxiosWrapper().forecastApi

  return {
    getAllModels,
    create,
    createWithCustomBody,
    getForecastingStatus,
    getForecastingResult,
    getForecastingResults,
    getForecastingPredictedResults,
    getForecastingPredictedTestResults,
    getQuickForecastingStatus,
    downloadForecastedDataset,
    downloadTestDataset,
    downloadCombinedTestDataset,
    getEvalMetrics,
    resetForecastingModels: useResetRecoilState(forecastingModelsAtom),
    resetForecastingModel: useResetRecoilState(forecastingModelAtom),
    resetModelParams: useResetRecoilState(modelParamsAtom),
    resetForecastingStatus: useResetRecoilState(forecastingStatusAtom),
    resetCreatedForecasting: useResetRecoilState(createdForecastingAtom),
    resetForecastingResult: useResetRecoilState(forecastingResultAtom),
    resetForecastingResults: useResetRecoilState(forecastingResultsAtom),
    resetForecastingPredictedResults: useResetRecoilState(
      forecastingPredictedResultsAtom
    ),
    resetForecastingPredictedTestResults: useResetRecoilState(
      forecastingPredictedTestResultsAtom
    ),
  }

  function createWithCustomBody(forecast) {
    return forecastApi.post(urlPartForecast, forecast)
  }

  function create(
    projectId,
    columnName,
    model,
    splitRatio,
    forecast,
    params,
    laggedFeatures
  ) {
    return forecastApi
      .post(`${urlPartForecast}/${projectId}/?column=${columnName}`, {
        model: model,
        status: 'Ready',
        split_ratio: splitRatio,
        auto_tune: forecast.autoTune,
        tune_brute_force: forecast.autoTuneParams.bruteForce,
        tune_level: forecast.autoTuneParams.tuneLevel,
        use_log_transform: forecast.preprocessing.useLog,
        use_decomposition: forecast.preprocessing.useDecompose,
        lag_window: forecast.lagWindow,
        lagged_features: laggedFeatures,
        forecast_horizon: forecast.forecastHorizon,
        params: JSON.stringify(params),
        results_filename: 'forecast_results.csv',
      })
      .then((response) => response.data)
      .then(setCreatedForecasting)
  }

  function getAllModels() {
    return forecastApi
      .get(urlPartForecast + '/models')
      .then((response) => response.data)
      .then(setForecastingModels)
  }

  function getForecastingStatus(id) {
    return forecastApi
      .get(`${urlPartForecast}/${id}/status/`)
      .then((response) => response.data)
      .then(setForecastingStatus)
  }

  function getForecastingResult(id) {
    return forecastApi
      .get(`${urlPartForecast}/${id}/`)
      .then((response) => response.data)
      .then(setForecastingResult)
  }

  function getForecastingResults() {
    return forecastApi
      .get(`${urlPartForecast}/user/`)
      .then((response) => response.data)
      .then(setForecastingResults)
  }

  function getForecastingPredictedResults(id) {
    return forecastApi
      .get(`${urlPartForecast}/${id}/results/`)
      .then((response) => response.data)
      .then(setForecastingPredictedResults)
  }

  function getForecastingPredictedTestResults(id) {
    return forecastApi
      .get(`${urlPartForecast}/${id}/test-results/`)
      .then((response) => response.data)
      .then(setForecastingPredictedTestResults)
  }

  function getQuickForecastingStatus(id) {
    return forecastApi
      .get(urlPartForecast + '/status/' + id)
      .then((response) => response.data)
  }

  function downloadTestDataset(forecast) {
    return forecastApi({
      url: `${urlPartForecast}/${forecast.id}/test-results/download/`,
      method: 'GET',
      responseType: 'blob', // important
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      let filename =
        'test_results_' +
        forecast.datasetcolumns.datasets.project.title +
        '_' +
        forecast.datasetcolumns.name +
        '_' +
        forecast.model +
        '_' +
        forecast.split_ratio +
        '_' +
        (100 - forecast.split_ratio) +
        '.csv'
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
    })
  }

  function downloadCombinedTestDataset(forecast) {
    return forecastApi({
      url: `${urlPartForecast}/${forecast.id}/combined-test-results/download/`,
      method: 'GET',
      responseType: 'blob', // important
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      let filename =
        'combined_test_results_' +
        forecast.datasetcolumns.datasets.project.title +
        '_' +
        forecast.datasetcolumns.name +
        '_' +
        forecast.model +
        '_' +
        forecast.split_ratio +
        '_' +
        (100 - forecast.split_ratio) +
        '.csv'
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
    })
  }

  function downloadForecastedDataset(forecast) {
    return forecastApi({
      url: `${urlPartForecast}/${forecast.id}/results/download/`,
      method: 'GET',
      responseType: 'blob', // important
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      let filename =
        'forecast_results_' +
        forecast.datasetcolumns.datasets.project.title +
        '_' +
        forecast.datasetcolumns.name +
        '_' +
        forecast.model +
        '_' +
        forecast.split_ratio +
        '_' +
        (100 - forecast.split_ratio) +
        '.csv'
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
    })
  }

  function getEvalMetrics(id) {
    return forecastApi
      .get(urlPartForecast + '/' + id + '/evaluation_metrics/')
      .then((response) => response.data)
      .then((data) => {
        console.log(data)
      })
  }
}
