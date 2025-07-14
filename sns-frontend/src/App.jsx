import { useState } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'

import './styles/common.css'
import Navbar from './components/shared/Navbar'
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { checkAuthStatusThunk } from './features/authSlice'
import PostCreatePage from './pages/PostCreatePage'

function App() {
   const dispatch = useDispatch()
   const { isAuthenticated, user } = useSelector((state) => state.auth) // 로그인 상태, 로그인한 사용자 정보 select
   //로그아웃 상태일 경우 user: null

   //새로고침시 redux에서 사용하는 state가 초기화됨 -> 지속적인 로그인 상태 확인을 위해 사용
   useEffect(() => {
      dispatch(checkAuthStatusThunk())
   }, [dispatch])
   return (
      <>
         <Navbar isAuthenticated={isAuthenticated} user={user} />
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/posts/create" element={<PostCreatePage />}></Route>
         </Routes>
      </>
   )
}

export default App
