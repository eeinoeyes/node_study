import { TextField, Button, Container, Typography, CircularProgress } from '@mui/material'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUserThunk, clearAuthError } from '../../features/authSlice'
import { useEffect } from 'react'

function Login() {
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { loading, error } = useSelector((state) => state.auth)

   useEffect(() => {
      // 로그인 컴포넌트를 벗어날 때 error state가 null로 초기화됨 (reducer에서 정의한 값)
      return () => {
         dispatch(clearAuthError())
      }
   }, [dispatch])

   const handleLogin = (e) => {
      e.preventDefault()
      if (!email.trim || !password.trim()) {
         alert('이메일과 패스워드는 필수 입력 값입니다.')
         return
      }
      dispatch(loginUserThunk({ email, password }))
         .unwrap()
         .then(() => navigate('/')) //로그인 성공시 메인 페이지로 이동
         .catch((err) => console.error('로그인 실패:', err))
   }
   return (
      <Container maxWidth="sm">
         <Typography variant="h4" gutterBottom>
            로그인
         </Typography>

         {error && (
            <Typography color="error" align="center">
               {error}
            </Typography>
         )}

         <form onSubmit={handleLogin}>
            <TextField label="이메일" name="email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />

            <TextField label="비밀번호" type="password" name="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />

            <Button variant="contained" color="primary" type="submit" fullWidth disabled={loading} sx={{ position: 'relative', marginTop: '20px' }}>
               {loading ? (
                  <CircularProgress
                     size={24}
                     sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                     }}
                  />
               ) : (
                  '로그인'
               )}
            </Button>
         </form>

         <p>
            계정이 없으신가요? <Link to="/signup">회원가입</Link>
         </p>
      </Container>
   )
}

export default Login
