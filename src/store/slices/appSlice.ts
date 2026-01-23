import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import notificationService from '@/core/notifications'
import { database } from '@/core'

export interface AppState {
  loading: boolean
  error: string | null
  initialized: boolean
  selectedContextId: string | null
  isNotificationEnabled: boolean
}

const initialState: AppState = {
  loading: false,
  error: null,
  initialized: false,
  selectedContextId: null,
  isNotificationEnabled: false
}

export const initializeApp = createAsyncThunk(
  'app/initialize',
  async (_, { rejectWithValue }) => {
    try {
      await database.init()

      const isNotificationEnabled = await notificationService.init()

      return { isNotificationEnabled }
    } catch (error) {
      console.error('Error initializing app:', error)
      return rejectWithValue('Erro ao inicializar aplicação')
    }
  }
)

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setSelectedContext: (state, action: PayloadAction<string | null>) => {
      state.selectedContextId = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeApp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.isNotificationEnabled = action.payload.isNotificationEnabled
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { setLoading, setError, clearError, setSelectedContext } =
  appSlice.actions

export default appSlice.reducer
