import { createSlice } from '@reduxjs/toolkit';

const chainsSlice = createSlice({
  name: 'chains',
  initialState: [],
  reducers: {
    setChains: (state, action) => {
      return action.payload;
    },
    updateChainStatus: (state, action) => {
      const { chainId, status } = action.payload;
      const chain = state.find(c => c.id === chainId);
      if (chain) {
        chain.status = status;
      }
    }
  }
});

export const { setChains, updateChainStatus } = chainsSlice.actions;
export default chainsSlice.reducer;