import { createSlice } from '@reduxjs/toolkit';

const deleteThisWalletModalSlice = createSlice({
  name: 'deleteThisWalletModal',
  initialState: {
    deleteThisWalletModal: false,
  },
  reducers: {
    setDeleteThisWalletModal(state, action) {
      state.deleteThisWalletModal = action.payload;
    },
  },
});

export const { setDeleteThisWalletModal } = deleteThisWalletModalSlice.actions;

export default deleteThisWalletModalSlice.reducer;
