import {createSlice} from '@reduxjs/toolkit';

const passwordSlice = createSlice({
  name: 'password',
  initialState: {
    password: '',
    resetStatus: false,
  },
  reducers: {
    setPassword(state, action) {
      state.password = action.payload;
    },
    setStatusResetPassword(state, action) {
      state.resetStatus = action.payload;
    },
  },
});

export const {setPassword, setStatusResetPassword} = passwordSlice.actions;

export default passwordSlice.reducer;
