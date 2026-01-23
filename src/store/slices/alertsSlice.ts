import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import alertStore from '@/features/alerts/stores/alert-store'
import notificationService from '@/core/notifications'
import { FullAlert, Alert } from '@/features/alerts/types/alert'

export interface AlertsState {
  loading: boolean
  error: string | null
  alerts: FullAlert[]
}

const initialState: AlertsState = {
  loading: false,
  error: null,
  alerts: []
}

export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const allAlerts = await alertStore.getAll()
      return allAlerts
    } catch (error) {
      console.error('Error fetching alerts:', error)
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : `Fetch all alerts failed, ${error}`
      )
    }
  }
)

export const addAlert = createAsyncThunk(
  'alerts/add',
  async (alertData: Alert, { rejectWithValue, dispatch }) => {
    try {
      const alert = await alertStore.addAlert(alertData)

      await notificationService.scheduleAlert(alert)

      dispatch(fetchAlerts())
    } catch (error) {
      console.error('Error adding alert:', error)
      return rejectWithValue(
        error instanceof Error ? error.message : `Add alert failed, ${error}`
      )
    }
  }
)

export const updateAlert = createAsyncThunk(
  'alerts/update',
  async (alertData: FullAlert, { rejectWithValue }) => {
    try {
      await alertStore.update(alertData)

      notificationService.cancelAlert(alertData.id)
      if (alertData.isActive) {
        await notificationService.scheduleAlert(alertData)
      }

      return alertData
    } catch (error) {
      console.error('Error updating alert:', error)
      return rejectWithValue(
        error instanceof Error ? error.message : `Update alert failed, ${error}`
      )
    }
  }
)

export const deleteAlert = createAsyncThunk(
  'alerts/delete',
  async (alertId: string, { rejectWithValue }) => {
    try {
      notificationService.cancelAlert(alertId)

      await alertStore.delete(alertId)
      return alertId
    } catch (error) {
      console.error('Error deleting alert:', error)
      return rejectWithValue(
        error instanceof Error ? error.message : `Delete alert failed, ${error}`
      )
    }
  }
)

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false
        state.alerts = action.payload
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addAlert.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addAlert.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(addAlert.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateAlert.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAlert.fulfilled, (state, action) => {
        state.loading = false
        state.alerts = state.alerts.map((alert) =>
          alert.id === action.payload.id ? action.payload : alert
        )
      })
      .addCase(updateAlert.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(deleteAlert.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.loading = false
        state.alerts = state.alerts.filter(
          (alert) => alert.id !== action.payload
        )
      })
      .addCase(deleteAlert.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError } = alertsSlice.actions

export default alertsSlice.reducer
