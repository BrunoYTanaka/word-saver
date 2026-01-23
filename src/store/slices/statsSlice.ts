import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Stats, StatsStore } from '../../features/analytics'

export interface StatsState {
  loading: boolean
  error: string | null
  stats: Stats
}

const initialState: StatsState = {
  loading: false,
  error: null,
  stats: {} as Stats
}

export const fetchStats = createAsyncThunk(
  'stats/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await StatsStore.getStats()
      return stats
    } catch (error) {
      console.error('Error refreshing stats:', error)
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : `Refresh stats failed, ${error}`
      )
    }
  }
)

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError } = statsSlice.actions

export default statsSlice.reducer
