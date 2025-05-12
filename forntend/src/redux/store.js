import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from 'redux-persist';
import themeReducer from "./Theme/themeSlice";
import speechReducer from "./user/speechSlice";
import historyReducer from "./user/historySlice";
import audioMessageReducer from "./user/audioMessageSlice";
// Configure persistence
const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
  speech: speechReducer,
  history: historyReducer,
  audioMessage: audioMessageReducer,
});
// Configure redux persistence
const persistConfig = {
  key: "root",
  storage,
  version: 1,
};

// Wrap your reducer with the persistReducer function
const persisteReducer = persistReducer(persistConfig, rootReducer);

////
export const store = configureStore({
  reducer: persisteReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({serializableCheck:false})
});

export const persistor=persistStore(store)
