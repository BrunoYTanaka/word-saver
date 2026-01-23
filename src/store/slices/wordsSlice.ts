import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import wordStore from '../../features/vocabulary/words/stores/word-store'
import { FullWord, Word } from '../../features/vocabulary/words/types/word'

export interface WordsState {
  loading: boolean
  error: string | null
  words: FullWord[]
}

const initialState: WordsState = {
  loading: false,
  error: null,
  words: []
}

export const fetchWords = createAsyncThunk(
  'words/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const allWords = await wordStore.getAll()
      return allWords
    } catch (error) {
      console.error('Error fetching words:', error)
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : `Fetch all words failed, ${error}`
      )
    }
  }
)

export const addWord = createAsyncThunk(
  'words/add',
  async (wordData: Word, { rejectWithValue, dispatch }) => {
    try {
      await wordStore.addWord(wordData)

      dispatch(fetchWords())
    } catch (error) {
      console.error('Error adding word:', error)
      return rejectWithValue(
        error instanceof Error ? error.message : `Add word failed, ${error}`
      )
    }
  }
)

export const updateWord = createAsyncThunk(
  'words/update',
  async (wordData: FullWord, { rejectWithValue }) => {
    try {
      await wordStore.update(wordData)
      return wordData
    } catch (error) {
      console.error('Error updating word:', error)
      return rejectWithValue(
        error instanceof Error ? error.message : `Update word failed, ${error}`
      )
    }
  }
)

export const deleteWord = createAsyncThunk(
  'words/delete',
  async (wordId: string, { rejectWithValue }) => {
    try {
      await wordStore.delete(wordId)
      return wordId
    } catch (error) {
      console.error('Error deleting word:', error)
      return rejectWithValue(
        error instanceof Error ? error.message : `Delete word failed, ${error}`
      )
    }
  }
)

export const reviewWord = createAsyncThunk(
  'words/review',
  async (wordId: string, { rejectWithValue }) => {
    try {
      await wordStore.updateWordReview(wordId)
      const updatedWord = await wordStore.get<FullWord>(wordId)
      return updatedWord
    } catch (error) {
      console.error('Error reviewing word:', error)
      return rejectWithValue(
        error instanceof Error ? error.message : `Review word failed, ${error}`
      )
    }
  }
)

const wordsSlice = createSlice({
  name: 'words',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWords.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWords.fulfilled, (state, action) => {
        state.loading = false
        state.words = action.payload
      })
      .addCase(fetchWords.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addWord.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addWord.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(addWord.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateWord.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateWord.fulfilled, (state, action) => {
        state.loading = false
        state.words = state.words.map((word) =>
          word.id === action.payload.id ? action.payload : word
        )
      })
      .addCase(updateWord.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(deleteWord.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteWord.fulfilled, (state, action) => {
        state.loading = false
        state.words = state.words.filter((word) => word.id !== action.payload)
      })
      .addCase(deleteWord.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(reviewWord.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(reviewWord.fulfilled, (state, action) => {
        state.loading = false
        state.words = state.words.map((word) =>
          word.id === action.payload.id ? action.payload : word
        )
      })
      .addCase(reviewWord.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError } = wordsSlice.actions

export default wordsSlice.reducer
