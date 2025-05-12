// import { createSlice } from "@reduxjs/toolkit";
// //// user slice for loading and error and current usres
// const initialState = {
//   currentUser: null,
//   error: null,
//   loading:false,
// };

// // f => take obj
// const UsreSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     signInStart: (state) => {
//         state.loading = true;
//         state.error=null
//    },

//    signInSuccess: (state, action) => {
//     state.loading = false;
//     state.currentUser = action.payload;
//     state.error=null
//    },

//    signInFailure: (state, action) => {
//     state.loading = false;
//     state.error=action.payload
//    },

//    updateStart:(state)=>{
//     state.loading=true,
//     state.error=null
//    },
//    updateSuccess:(state,action)=>{
//     state.loading=false,
//     state.currentUser=action.payload,
//     state.error=null
//    },
//    updateFailure:(state,action)=>{
//     state.loading=false,
//     state.error=action.payload
//    },
//    deleteUserStart:(state)=>{
//     state.loading=true,
//     state.error=null
//    },
//    deleteUserSuccess:(state)=>{
//     state.currentUser=null,
//     state.loading=true,
//     state.error=null
//   },
//   deleteUserFailure:(state,action)=>{
//     state.loading=false,
//     state.error=action.payload
//    },
//    signOutSuccess:(state)=>{
//     state.currentUser=null,
//     state.loading=false,
//     state.error=null
//    },
//   }
// });


// export const {signInStart,signInSuccess,
//              signInFailure,updateStart,updateSuccess,
//              updateFailure,deleteUserStart,deleteUserSuccess,
//              deleteUserFailure,signOutSuccess}=UsreSlice.actions;

// export default UsreSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      state.loading = false;
      state.currentUser = action.payload;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStart: (state) => {
      (state.loading = true), (state.error = null);
    },
    updateSuccess: (state, action) => {
      (state.loading = false),
        (state.currentUser = action.payload),
        (state.error = null);
    },
    updateFailure: (state, action) => {
      (state.loading = false), (state.error = action.payload);
    },
    deleteUserStart: (state) => {
      (state.loading = true), (state.error = null);
    },
    deleteUserSuccess: (state) => {
      (state.currentUser = null), (state.loading = true), (state.error = null);
    },
    deleteUserFailure: (state, action) => {
      (state.loading = false), (state.error = action.payload);
    },
    signOutSuccess: (state) => {
      (state.currentUser = null), (state.loading = false), (state.error = null);
    },
  },
});

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutSuccess,
} = userSlice.actions;

export default userSlice.reducer;