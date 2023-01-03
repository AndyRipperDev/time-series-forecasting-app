import { atom } from 'recoil';

const forecastingModelsAtom = atom({
  key: 'forecastingModels',
  default: null
});

export {
  forecastingModelsAtom
};