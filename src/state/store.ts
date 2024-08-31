import { IAppointmentState, UserState } from "@/types";
import { combineReducers, configureStore, Reducer } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import appointementReducer from "./appointementReducer";
import userReducer from "./userReducer";

// Persist configuration
const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    user: userReducer as Reducer<UserState>,
    appointment: appointementReducer as Reducer<IAppointmentState>,
  })
);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  // Add any other middleware or enhancers here
});

const persistor = persistStore(store);

export { persistor, store };
