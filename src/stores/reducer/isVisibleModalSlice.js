import { createSlice } from '@reduxjs/toolkit';

const isVisibleModalSlice = createSlice({
  name: 'isVisibleModal',
  initialState: {
    isVisibleModal: false,
  },
  reducers: {
    setVisibleModal(state, action) {
      state.isVisibleModal = action.payload;
    },
  },
});

export const { setVisibleModal } = isVisibleModalSlice.actions;

export default isVisibleModalSlice.reducer;
