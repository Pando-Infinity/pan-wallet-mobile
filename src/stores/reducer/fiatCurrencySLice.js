import { createSlice } from '@reduxjs/toolkit';

const fiatCurrencySLice = createSlice({
  name: 'fiatCurrency',
  initialState: {
    fiat: '',
  },
  reducers: {
    setFiat(state, action) {
      state.fiat = action.payload;
    },
  },
});

export const { setFiat } = fiatCurrencySLice.actions;
export default fiatCurrencySLice.reducer;
