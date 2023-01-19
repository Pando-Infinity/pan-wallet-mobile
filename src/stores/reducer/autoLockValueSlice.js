import { createSlice } from '@reduxjs/toolkit';

const autoLockValueSlice = createSlice({
  name: 'autoLockValue',
  initialState: {
    autoLockValue: '',
  },
  reducers: {
    setAutoLockValue(state, action) {
      state.autoLockValue = action.payload;
    },
  },
});

export const { setAutoLockValue } = autoLockValueSlice.actions;

export default autoLockValueSlice.reducer;
