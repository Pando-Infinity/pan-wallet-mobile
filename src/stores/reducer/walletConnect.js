import { createSlice } from '@reduxjs/toolkit';

const walletConnect = createSlice({
  name: 'walletConnect',
  initialState: {
    loading: false,
  },
  reducers: {
    updateLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { updateLoading } = walletConnect.actions;

export default walletConnect.reducer;
