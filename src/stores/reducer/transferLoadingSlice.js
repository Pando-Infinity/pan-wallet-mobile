import { createSlice } from '@reduxjs/toolkit';
import { removeItemOnce } from 'utils/util';

const transferLoadingSlice = createSlice({
  name: 'transferLoading',
  initialState: {
    transferLoading: [],
  },
  reducers: {
    pushTransferLoading(state, action) {
      state.transferLoading.push(action.payload);
    },

    removeTransferLoading(state, action) {
      removeItemOnce(state.transferLoading, action.payload);
    },
  },
});

export const { pushTransferLoading, removeTransferLoading } =
  transferLoadingSlice.actions;

export default transferLoadingSlice.reducer;
