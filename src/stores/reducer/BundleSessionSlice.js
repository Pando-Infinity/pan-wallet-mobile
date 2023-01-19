import { createSlice } from '@reduxjs/toolkit'

const bundleSlice = createSlice({
    name: 'bundles',
    initialState: {
        bundles: [],
    },
    reducers: {
        setBundles(state, action) {
            state.bundles = action.payload
        },
    }
})

export const { setBundles } = bundleSlice.actions;
export default bundleSlice.reducer;