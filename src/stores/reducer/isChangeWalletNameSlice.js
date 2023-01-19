import {createSlice} from '@reduxjs/toolkit';

const isChangeWalletNameSlice = createSlice({
  name: 'isChangeWalletName',
  initialState: {
    isChangeWalletName: false,
  },
  reducers: {
    setChangeWalletName(state, action) {
      state.isChangeWalletName = action.payload;
    },
  },
});

export const {setChangeWalletName} = isChangeWalletNameSlice.actions;

export default isChangeWalletNameSlice.reducer;
