import { useSetRecoilState, useRecoilState, useResetRecoilState } from 'recoil'

import { useAxiosWrapper } from '../helpers'
import { forecastingModelsAtom, forecastingModelAtom, modelParamsAtom, forecastingStatusAtom} from '../state'

export { useForecastService }

function useForecastService() {
  const urlPartForecast = '/forecast'
  const setForecastingModels = useSetRecoilState(forecastingModelsAtom)
  const setForecastingModel = useSetRecoilState(forecastingModelAtom)
  const setForecastingStatus = useSetRecoilState(forecastingStatusAtom)
  const setModelParams = useSetRecoilState(modelParamsAtom)
  const forecastApi = useAxiosWrapper().forecastApi

  return {
    getAllModels,
    getForecastingStatus,
    getQuickForecastingStatus,
    resetForecastingModels: useResetRecoilState(forecastingModelsAtom),
    resetForecastingModel: useResetRecoilState(forecastingModelAtom),
    resetModelParams: useResetRecoilState(modelParamsAtom),
    resetForecastingStatus: useResetRecoilState(forecastingStatusAtom),
  }

  function getAllModels() {
    return forecastApi
      .get(urlPartForecast + '/models')
      .then((response) => response.data)
      .then(setForecastingModels)
  }

  function getForecastingStatus(id) {
    return forecastApi
      .get(urlPartForecast + '/status/' + id)
      .then((response) => response.data)
      .then(setForecastingStatus)
  }

  function getQuickForecastingStatus(id) {
    return forecastApi
      .get(urlPartForecast + '/status/' + id)
      .then((response) => response.data)
  }
}
