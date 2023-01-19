import { createSlice } from '@reduxjs/toolkit';

const dataListWalletSlice = createSlice({
  name: 'dataListWallet',
  initialState: {
    listWallet: [],
    listAddress: [],
  },
  reducers: {
    setListWallet(state, action) {
      state.listWallet = action.payload;
    },
    setListAddress(state, action) {
      state.listAddress = action.payload;
    },
  },
});

export const { setListWallet, setListAddress } = dataListWalletSlice.actions;
export default dataListWalletSlice.reducer;
