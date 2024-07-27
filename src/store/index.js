import { configureStore } from '@reduxjs/toolkit';
import downloadReducer from './downloadSlice';

export const store = configureStore({
  reducer: {
    downloads: downloadReducer,
  },
});