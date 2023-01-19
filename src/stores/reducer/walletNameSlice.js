import {createSlice} from '@reduxjs/toolkit';

const walletNameSlice = createSlice({
  name: 'walletName',
  initialState: {
    walletName: '',
  },
  reducers: {
    setWalletName(state, action) {
      state.walletName = action.payload;
    },
  },
});

export const {setWalletName} = walletNameSlice.actions;

export default walletNameSlice.reducer;
