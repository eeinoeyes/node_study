import { Container } from '@mui/material'
import PostCreateForm from '../components/post/PostCreateForm'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createPostThunk } from '../features/postSlice'

function PostCreatePage() {
   const dispatch = useDispatch()
   const navigate = useNavigate()

   const onPostCreate = (postData) => {
      // postData = PostCreateForm.jsx의 formData
      dispatch(createPostThunk(postData))
         .unwrap()
         .then(() => {
            navigate('/') // 게시물 등록 후 메인 페이지로 이동
         })
         .catch((error) => {
            console.log('게시물 등록 에러:', error)
            alert('게시물 등록에 실패했습니다.')
         })
   }
   return (
      <Container maxWidth="md">
         <h1>게시물 등록</h1>
         <PostCreateForm onPostCreate={onPostCreate} />
      </Container>
   )
}

export default PostCreatePage
