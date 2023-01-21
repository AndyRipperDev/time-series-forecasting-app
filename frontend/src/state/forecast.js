import { atom } from 'recoil';

const forecastingModelsAtom = atom({
  key: 'forecastingModels',
  default: null
});

const forecastingModelAtom = atom({
  key: 'forecastingModel',
  default: null
});

const modelParamsAtom = atom({
  key: 'modelParams',
  default: null
});

const forecastingStatusAtom = atom({
  key: 'forecastingStatus',
  default: null
});

const createdForecastingAtom = atom({
  key: 'createdForecasting',
  default: null
});

const forecastingResultAtom = atom({
  key: 'forecastingResult',
  default: null
});

const forecastingResultsAtom = atom({
  key: 'forecastingResults',
  default: null
});

export {
  forecastingModelsAtom,
  forecastingModelAtom,
  modelParamsAtom,
  forecastingStatusAtom,
  createdForecastingAtom,
  forecastingResultsAtom,
  forecastingResultAtom
};