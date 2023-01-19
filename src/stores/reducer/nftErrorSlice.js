import { createSlice } from '@reduxjs/toolkit';

const nftErrorSlice = createSlice({
  name: 'nftErrorLabel',
  initialState: {
    nftErrorLabel: '',
  },
  reducers: {
    setNftErrorLabel(state, action) {
      state.nftErrorLabel = action.payload;
    },
  },
});

export const { setNftErrorLabel } = nftErrorSlice.actions;
export default nftErrorSlice.reducer;
