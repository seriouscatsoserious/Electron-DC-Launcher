import { createSlice } from '@reduxjs/toolkit';

const chainsSlice = createSlice({
  name: 'chains',
  initialState: [],
  reducers: {
    setChains: (state, action) => {
      return action.payload;
    },
    updateChainStatus: (state, action) => {
      const { chainId, status, progress } = action.payload;
      const chain = state.find(c => c.id === chainId);
      if (chain) {
        chain.status = status;
        if (progress !== undefined) {
          chain.progress = progress;
        }
      }
    },
  }
});

export const { setChains, updateChainStatus } = chainsSlice.actions;
export default chainsSlice.reducer;