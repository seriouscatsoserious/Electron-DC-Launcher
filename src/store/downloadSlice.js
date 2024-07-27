import { createSlice } from '@reduxjs/toolkit';

const downloadSlice = createSlice({
  name: 'downloads',
  initialState: {},
  reducers: {
    updateDownloadProgress: (state, action) => {
      const { chainId, progress, status } = action.payload;
      state[chainId] = { progress, status };
    },
    removeDownload: (state, action) => {
      delete state[action.payload];
    }
  }
});

export const { updateDownloadProgress, removeDownload } = downloadSlice.actions;
export default downloadSlice.reducer;