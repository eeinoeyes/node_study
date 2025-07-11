import { TextField, Button, Container, Typography, CircularProgress } from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { registerUserThunk, clearAuthError } from '../../features/authSlice'
import { useEffect } from 'react'

function Signup() {
   const [email, setEmail] = useState('')
   const [nick, setNick] = useState('')
   const [password, setPassword] = useState('')
   const [confirmPassword, setConfirmPassword] = useState('') // 비밀번호 확인
   const [isSignupComplete, setIsSignupComplete] = useState(false) // 회원가입 완료 여부

   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { loading, error } = useSelector((state) => state.auth)

   // 라우터 사용시 경로 변경 -> 이전 컴포넌트 언마운트, 다음 타겟 컴포넌트 마운팅
   //이 뒷정리 함수는 회원가입 컴포넌트를 벗어날 때, 즉 회원가입 컴포넌트가 언마운트 되기 직전에 실행됨 > 다음 컴포넌트 이동시 error state는 이미 null이 된 상태
   useEffect(() => {
      //회원가입 컴포넌트를 벗어날 때 error state가 null로 초기화
      return () => {
         dispatch(clearAuthError())
      }
   }, [dispatch])

   //회원가입 버튼 클릭시 실행할 액션 함수
   const handleSignup = () => {
      if (!email.trim() || !nick.trim() || !password.trim() || !confirmPassword.trim()) {
         alert('모든 필드를 입력하세요.')
         return
      }

      if (password !== confirmPassword) {
         alert('비밀번호가 일치하지 않습니다.')
         return
      }

      dispatch(registerUserThunk({ email, nick, password }))
         .unwrap()
         .then(() => {
            //회원가입 성공시
            setIsSignupComplete(true)
         })
         .catch((err) => {
            //회원가입 실패시(도중 에러 발생)
            console.error('회원가입 실패:', err.message || err)
         })
   }

   //회원가입이 완료되었을 때 보여줄 컴포넌트
   if (isSignupComplete) {
      return (
         <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom align="center">
               회원가입이 완료되었습니다!
            </Typography>
            <Typography variant="body1" align="center" style={{ marginTop: '20px' }}>
               로그인 페이지로 이동하거나 다른 작업을 계속 진행할 수 있습니다.
            </Typography>
            <Button
               variant="contained"
               color="primary"
               fullWidth
               style={{ marginTop: '20px' }}
               onClick={() => navigate('/login')} // 로그인 페이지로 이동
            >
               로그인 하러 가기
            </Button>
         </Container>
      )
   }

   return (
      <Container maxWidth="sm">
         <Typography variant="h4" gutterBottom>
            회원가입
         </Typography>

         {error && (
            <Typography color="error" align="center">
               {error}
            </Typography>
         )}

         <TextField label="이메일" variant="outlined" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
         <TextField label="사용자 이름" variant="outlined" fullWidth margin="normal" value={nick} onChange={(e) => setNick(e.target.value)} />
         <TextField label="비밀번호" variant="outlined" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
         <TextField label="비밀번호 확인" variant="outlined" type="password" fullWidth margin="normal" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

         {/* 로딩 중 회원가입 버튼 비활성화 */}
         <Button variant="contained" color="primary" onClick={handleSignup} fullWidth disabled={loading} style={{ marginTop: '20px' }}>
            {loading ? <CircularProgress size={24} /> : '회원가입'}
         </Button>
      </Container>
   )
}

export default Signup
