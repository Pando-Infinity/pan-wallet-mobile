import {createSlice} from '@reduxjs/toolkit';

const isShowLabelUnLockWithBiometricSlice = createSlice({
  name: 'isShowLabelUnLockWithBiometric',
  initialState: {
    isShowLabelUnLockWithBiometric: true,
  },
  reducers: {
    setShowLabelUnLockWithBiometric(state, action) {
      state.isShowLabelUnLockWithBiometric = action.payload;
    },
  },
});

export const {setShowLabelUnLockWithBiometric} =
  isShowLabelUnLockWithBiometricSlice.actions;

export default isShowLabelUnLockWithBiometricSlice.reducer;
