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

export {
  forecastingModelsAtom,
  forecastingModelAtom,
  modelParamsAtom
};