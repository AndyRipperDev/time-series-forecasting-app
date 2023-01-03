import { useSetRecoilState, useRecoilState, useResetRecoilState } from 'recoil'

import { useAxiosWrapper } from '../helpers'
import { forecastingModelsAtom } from '../state'

export { useForecastService }

function useForecastService() {
  const urlPartForecast = '/forecast'
  const setForecastingModels = useSetRecoilState(forecastingModelsAtom)
  const forecastApi = useAxiosWrapper().forecastApi

  return {
    getAllModels,
    resetForecastingModels: useResetRecoilState(forecastingModelsAtom),
  }

  function getAllModels() {
    return forecastApi
      .get(urlPartForecast + '/models')
      .then((response) => response.data)
      .then(setForecastingModels)
  }
}
