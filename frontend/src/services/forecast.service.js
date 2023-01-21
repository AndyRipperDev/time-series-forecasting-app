import { useSetRecoilState, useRecoilState, useResetRecoilState } from 'recoil'

import { useAxiosWrapper } from '../helpers'
import { forecastingModelsAtom, forecastingModelAtom, modelParamsAtom, forecastingStatusAtom, createdForecastingAtom, forecastingResultAtom, forecastingResultsAtom} from '../state'

export { useForecastService }

function useForecastService() {
  const urlPartForecast = '/forecast'
  const setForecastingModels = useSetRecoilState(forecastingModelsAtom)
  const setForecastingModel = useSetRecoilState(forecastingModelAtom)
  const setForecastingStatus = useSetRecoilState(forecastingStatusAtom)
  const setForecastingResult = useSetRecoilState(forecastingResultAtom)
  const setForecastingResults = useSetRecoilState(forecastingResultsAtom)
  const setModelParams = useSetRecoilState(modelParamsAtom)
  const setCreatedForecasting = useSetRecoilState(createdForecastingAtom)
  const forecastApi = useAxiosWrapper().forecastApi

  return {
    getAllModels,
    create,
    create2,
    getForecastingStatus,
    getForecastingResult,
    getForecastingResults,
    getQuickForecastingStatus,
    resetForecastingModels: useResetRecoilState(forecastingModelsAtom),
    resetForecastingModel: useResetRecoilState(forecastingModelAtom),
    resetModelParams: useResetRecoilState(modelParamsAtom),
    resetForecastingStatus: useResetRecoilState(forecastingStatusAtom),
    resetCreatedForecasting: useResetRecoilState(createdForecastingAtom),
    resetForecastingResult: useResetRecoilState(forecastingResultAtom),
    resetForecastingResults: useResetRecoilState(forecastingResultsAtom),
  }

  function create(forecast) {
    return forecastApi.post(urlPartForecast, forecast)
  }

  function create2(projectId, columnName, model, splitRatio, forecast) {
    return forecastApi.post(`${urlPartForecast}/${projectId}/?column=${columnName}`, {
      model: model,
      status: 'Ready',
      split_ratio: splitRatio,
      params: JSON.stringify(forecast),
      results_filename: 'forecast_results.csv'
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

  function getQuickForecastingStatus(id) {
    return forecastApi
      .get(urlPartForecast + '/status/' + id)
      .then((response) => response.data)
  }
}
