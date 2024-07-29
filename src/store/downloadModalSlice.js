import { createSlice } from '@reduxjs/toolkit';

const downloadModalSlice = createSlice({
  name: 'downloadModal',
  initialState: {
    isVisible: false,
  },
  reducers: {
    showDownloadModal: (state) => {
      state.isVisible = true;
    },
    hideDownloadModal: (state) => {
      state.isVisible = false;
    },
  },
});

export const { showDownloadModal, hideDownloadModal } = downloadModalSlice.actions;
export default downloadModalSlice.reducer;