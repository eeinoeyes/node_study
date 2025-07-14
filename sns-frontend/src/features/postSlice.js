import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createPost } from '../api/snsApi'

// 게시물 등록 Thunk
export const createPostThunk = createAsyncThunk('posts/createPost', async (postData, { rejectWithValue }) => {
   try {
      const response = await createPost(postData)
      console.log('response:', response)

      return response.data.post
   } catch (error) {
      return rejectWithValue(error.response?.data?.message)
   }
})

// // 게시물 수정
// export const updatePostThunk = createAsyncThunk('posts/updatePost', async (data, { rejectWithValue }) => {
//    try {
//    } catch (error) {
//       return rejectWithValue(error.response?.data?.message)
//    }
// })

// // 게시물 삭제
// export const deletePostThunk = createAsyncThunk('posts/deletePost', async (id, { rejectWithValue }) => {
//    try {
//    } catch (error) {
//       return rejectWithValue(error.response?.data?.message)
//    }
// })

// // 특정 게시물 가져오기
// export const fetchPostByIdThunk = createAsyncThunk('posts/fetchPostById', async (id, { rejectWithValue }) => {
//    try {
//    } catch (error) {
//       return rejectWithValue(error.response?.data?.message)
//    }
// })

// // 전체 게시물 리스트 가져오기
// export const fetchPostsThunk = createAsyncThunk('posts/fetchPosts', async (page, { rejectWithValue }) => {
//    try {
//    } catch (error) {
//       return rejectWithValue(error.response?.data?.message)
//    }
// })

const postSlice = createSlice({
   name: 'posts',
   initialState: {
      post: null,
      loading: false,
      error: null,
   },
   reducers: {},
   extraReducers: (builder) => {
      builder
         .addCase(createPostThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(createPostThunk.fulfilled, (state, action) => {
            state.loading = false
            state.post = action.payload
         })
         .addCase(createPostThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
   },
})

export default postSlice.reducer
