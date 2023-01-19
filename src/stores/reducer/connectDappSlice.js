import { createSlice } from '@reduxjs/toolkit';

const ConnectDappSlice = createSlice({
  name: 'params',
  initialState: {
    params: [],
  },
  reducers: {
    pushParams(state, action) {
      const arr = state.params.filter(
        item => item.bundle === action.payload.bundle,
      );
      if (arr.length === 0) {
        state.params.push(action.payload);
      }
    },
    popParams(state) {
      state.params.pop();
    },
  },
});

export const { pushParams, popParams } = ConnectDappSlice.actions;
export default ConnectDappSlice.reducer;
