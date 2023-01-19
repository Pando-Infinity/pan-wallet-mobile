import { createSlice } from '@reduxjs/toolkit';

const hiddenUnlockSignInSlice = createSlice({
  name: 'hiddenUnlockSignIn',
  initialState: {
    hiddenUnlockSignIn: false,
  },
  reducers: {
    setHiddenUnlockSignIn(state, action) {
      state.hiddenUnlockSignIn = action.payload;
    },
  },
});

export const { setHiddenUnlockSignIn } = hiddenUnlockSignInSlice.actions;
export default hiddenUnlockSignInSlice.reducer;
