import {createSlice} from '@reduxjs/toolkit';

const navigationEventSlice = createSlice({
  name: 'navigationEvent',
  initialState: {
    navigationBackEvent: false,
  },
  reducers: {
    setNavigationBackEvent(state, action) {
      state.navigationBackEvent = action.payload;
    },
  },
});

export const {setNavigationBackEvent} = navigationEventSlice.actions;
export default navigationEventSlice.reducer;
