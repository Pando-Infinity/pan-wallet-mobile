import { createSlice } from '@reduxjs/toolkit';

const transactionSlice = createSlice({
  name: 'transaction',
  initialState: {
    transaction: {},
  },
  reducers: {
    setTransaction(state, action) {
      state.transaction = action.payload;
    },
  },
});

export const { setTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
