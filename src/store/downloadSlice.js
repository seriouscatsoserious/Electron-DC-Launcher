import { createSlice } from '@reduxjs/toolkit';

const downloadSlice = createSlice({
  name: 'downloads',
  initialState: {},
  reducers: {
    updateDownloads: (state, action) => {
      action.payload.forEach(download => {
        state[download.chainId] = download;
      });
      // Remove completed downloads
      Object.keys(state).forEach(chainId => {
        if (!action.payload.find(d => d.chainId === chainId)) {
          delete state[chainId];
        }
      });
    },
  }
});

export const { updateDownloads } = downloadSlice.actions;
export default downloadSlice.reducer;