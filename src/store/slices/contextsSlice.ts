import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import contextStore from '@/features/vocabulary/contexts/repositories/context-store'
import wordStore from '@/features/vocabulary/words/repositories/word-store'
import {
  FullContext,
  Context
} from '@/features/vocabulary/contexts/types/context'
import { FullWord } from '@/features/vocabulary/words/types/word'
import { fetchWords } from './wordsSlice'

export interface ContextsState {
  loading: boolean
  error: string | null
  contexts: FullContext[]
}

const initialState: ContextsState = {
  loading: false,
  error: null,
  contexts: []
}

export const fetchContexts = createAsyncThunk(
  'contexts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const allContexts = await contextStore.getContextWithWordCount()
      return allContexts
    } catch (error) {
      console.error('Error fetching contexts:', error)
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : `Fetch all contexts failed, ${error}`
      )
    }
  }
)

export const addContext = createAsyncThunk(
  'contexts/add',
  async (contextData: Context, { rejectWithValue, dispatch }) => {
    try {
      await contextStore.addContext(contextData)

      dispatch(fetchContexts())
    } catch (error) {
      console.error('Error adding context:', error)
      return rejectWithValue(
        error instanceof Error ? error.message : `Add context failed, ${error}`
      )
    }
  }
)

export const updateContext = createAsyncThunk(
  'contexts/update',
  async (contextData: FullContext, { rejectWithValue }) => {
    try {
      await contextStore.update(contextData)
      return contextData
    } catch (error) {
      console.error('Error updating context:', error)
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : `Update context failed, ${error}`
      )
    }
  }
)

export const deleteContext = createAsyncThunk(
  'contexts/delete',
  async (contextId: string, { rejectWithValue, dispatch }) => {
    try {
      const words = await wordStore.getWordsByContext(contextId)
      await Promise.all(
        words.map((word: FullWord) => wordStore.delete(word.id))
      )

      await contextStore.delete(contextId)
      dispatch(fetchWords())
      return contextId
    } catch (error) {
      console.error('Error deleting context:', error)
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : `Delete context failed, ${error}`
      )
    }
  }
)

const contextsSlice = createSlice({
  name: 'contexts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContexts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchContexts.fulfilled, (state, action) => {
        state.loading = false
        state.contexts = action.payload
      })
      .addCase(fetchContexts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addContext.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addContext.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(addContext.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateContext.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateContext.fulfilled, (state, action) => {
        state.loading = false
        state.contexts = state.contexts.map((context) =>
          context.id === action.payload.id ? action.payload : context
        )
      })
      .addCase(updateContext.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(deleteContext.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteContext.fulfilled, (state, action) => {
        state.loading = false
        state.contexts = state.contexts.filter(
          (context) => context.id !== action.payload
        )
      })
      .addCase(deleteContext.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError } = contextsSlice.actions

export default contextsSlice.reducer
