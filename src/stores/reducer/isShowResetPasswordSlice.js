import {createSlice} from '@reduxjs/toolkit';

const isShowResetPasswordSlice = createSlice({
  name: 'isShowResetPassWord',
  initialState: {
    isShowResetPassWord: true,
  },
  reducers: {
    setShowResetPassWord(state, action) {
      state.isShowResetPassWord = action.payload;
    },
  },
});

export const {setShowResetPassWord} = isShowResetPasswordSlice.actions;

export default isShowResetPasswordSlice.reducer;
