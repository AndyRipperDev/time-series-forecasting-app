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

const forecastingBaselineResultsAtom = atom({
  key: 'forecastingBaselineResults',
  default: null
});

const forecastingPredictedResultsAtom = atom({
  key: 'forecastingPredictedResults',
  default: null
});

const forecastingPredictedTestResultsAtom = atom({
  key: 'forecastingPredictedTestResults',
  default: null
});

export {
  forecastingModelsAtom,
  forecastingModelAtom,
  modelParamsAtom,
  forecastingStatusAtom,
  createdForecastingAtom,
  forecastingResultsAtom,
  forecastingResultAtom,
  forecastingBaselineResultsAtom,
  forecastingPredictedResultsAtom,
  forecastingPredictedTestResultsAtom
};