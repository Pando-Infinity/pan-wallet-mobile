import {createSlice} from '@reduxjs/toolkit';

const showChangePasswordSCSlice = createSlice({
  name: 'showChangePasswordSC',
  initialState: {
    showChangePasswordSC: false,
  },
  reducers: {
    setShowChangePasswordSC(state, action) {
      state.showChangePasswordSC = action.payload;
    },
  },
});

export const {setShowChangePasswordSC} = showChangePasswordSCSlice.actions;

export default showChangePasswordSCSlice.reducer;
