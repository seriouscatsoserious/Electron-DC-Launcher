import { configureStore } from '@reduxjs/toolkit';
import downloadReducer from './downloadSlice';
import chainsReducer from './chainsSlice';

export const store = configureStore({
  reducer: {
    downloads: downloadReducer,
    chains: chainsReducer,
  },
});