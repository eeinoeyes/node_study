import { Container } from '@mui/material'
import PostCreateForm from '../components/post/PostCreateForm'

function PostCreatePage() {
   const handleSubmit = () => {}
   return (
      <Container maxWidth="md">
         <h1>게시물 등록</h1>
         <PostCreateForm onSubmit={handleSubmit} />
      </Container>
   )
}

export default PostCreatePage
