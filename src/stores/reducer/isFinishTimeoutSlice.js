import { createSlice } from '@reduxjs/toolkit';

const isFinishTimeoutSlice = createSlice({
  name: 'isFinishTimeOut',
  initialState: {
    isFinishTimeout: false,
  },
  reducers: {
    setFinishTimeOut(state, action) {
      state.isFinishTimeout = action.payload;
    },
  },
});

export const { setFinishTimeOut } = isFinishTimeoutSlice.actions;
export default isFinishTimeoutSlice.reducer;
