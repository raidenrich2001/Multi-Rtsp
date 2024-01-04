import { configureStore, createSlice } from '@reduxjs/toolkit';


const mainStore = createSlice({
    name:'mainStore',
    initialState:{message:'',RTSParray: []},
    reducers:{
        setMessage(state,action){
            state.message = action.payload;
        },
        setRTSParray(state,action){
            state.RTSParray = action.payload;
        }
    }
})

export const actions = {
    ...mainStore.actions,
}

const store = configureStore({
    reducer: {
        mainStore: mainStore.reducer
    }
});

export default store;