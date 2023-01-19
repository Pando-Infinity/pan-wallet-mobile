import {createSlice} from '@reduxjs/toolkit';

const addressSlice = createSlice({
  name: 'accountAddress',
  initialState: {
    accountAddress: null,
  },
  reducers: {
    setAccountAddress(state, action) {
      state.accountAddress = action.payload;
    },
  },
});

export const {setAccountAddress} = addressSlice.actions;

export default addressSlice.reducer;
