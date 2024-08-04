import { createSlice } from '@reduxjs/toolkit';

const faucetSlice = createSlice({
  name: 'faucet',
  initialState: {
    isVisible: false,
    isLoading: false,
    error: null,
    success: null,
  },
  reducers: {
    showFaucetModal: state => {
      state.isVisible = true;
    },
    hideFaucetModal: state => {
      state.isVisible = false;
      state.error = null;
      state.success = null;
    },
    setClaimStatus: (state, action) => {
      state.isLoading = action.payload.isLoading;
      state.error = action.payload.error;
      state.success = action.payload.success;
    },
  },
});

export const { showFaucetModal, hideFaucetModal, setClaimStatus } =
  faucetSlice.actions;

export default faucetSlice.reducer;
