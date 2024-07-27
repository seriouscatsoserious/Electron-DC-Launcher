import { createSlice } from '@reduxjs/toolkit';

const downloadSlice = createSlice({
  name: 'downloads',
  initialState: {},
  reducers: {
    updateDownloadQueue: (state, action) => {
      const { chainId, status, progress } = action.payload;
      if (status === 'completed') {
        delete state[chainId];
      } else {
        state[chainId] = { status, progress };
      }
    }
  }
});

export const { updateDownloadQueue } = downloadSlice.actions;
export default downloadSlice.reducer;