import { configureStore } from '@reduxjs/toolkit'
import appReducer from './slices/appSlice'
import wordsReducer from './slices/wordsSlice'
import alertsReducer from './slices/alertsSlice'
import contextsReducer from './slices/contextsSlice'
import statsReducer from './slices/statsSlice'

export const store = configureStore({
  reducer: {
    app: appReducer,
    words: wordsReducer,
    alerts: alertsReducer,
    contexts: contextsReducer,
    stats: statsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST']
      }
    })
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
