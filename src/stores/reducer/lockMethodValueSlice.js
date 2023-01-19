import {createSlice} from '@reduxjs/toolkit';

const lockMethodValueSlice = createSlice({
  name: 'lockMethodValue',
  initialState: {
    lockMethodValue: '',
  },
  reducers: {
    setLockMethodValue(state, action) {
      state.lockMethodValue = action.payload;
    },
  },
});

export const {setLockMethodValue} = lockMethodValueSlice.actions;

export default lockMethodValueSlice.reducer;
