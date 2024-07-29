import { configureStore } from '@reduxjs/toolkit';
import downloadReducer from './downloadSlice';
import chainsReducer from './chainsSlice';
import downloadModalReducer from './downloadModalSlice';

export const store = configureStore({
  reducer: {
    downloads: downloadReducer,
    chains: chainsReducer,
    downloadModal: downloadModalReducer,
  },
});