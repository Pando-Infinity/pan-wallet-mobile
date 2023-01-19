import {createSlice} from '@reduxjs/toolkit';

const isVisibleChangeWalletNameSlice = createSlice({
  name: 'isVisibleChangeWalletName',
  initialState: {
    isVisibleChangeWalletName: false,
  },
  reducers: {
    setVisibleChangeWalletName(state, action) {
      state.isVisibleChangeWalletName = action.payload;
    },
  },
});

export const {setVisibleChangeWalletName} =
  isVisibleChangeWalletNameSlice.actions;

export default isVisibleChangeWalletNameSlice.reducer;
