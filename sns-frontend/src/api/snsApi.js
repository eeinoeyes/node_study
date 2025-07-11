import axios from 'axios'

const BASE_URL = import.meta.env.VITE_APP_API_URL

const snsApi = axios.create({
   baseURL: BASE_URL,
   headers: {
      'Content-type': 'application/json', //req, res 수행시 그 요청들을 json 객체로 주고받겠다
   },

   /*
     localhost:5173 -> 프론트엔드
     localhost:8000 -> 백엔드
     req, res 주소가 다른 경우 보안상 서로 통신이 불가능하고, 세션이나 쿠키도 주고받을 수 없음
     주소가 다른데도 통신이 이루어지는 경우 cors 에러 발생
     */

   withCredentials: true, // 세션 및 쿠키 데이터를 req에 포함
})

// 회원가입
export const registerUser = async (userData) => {
   // 파라미터 userData = 회원가입 창에서 입력한 데이터
   try {
      const response = await snsApi.post('/auth/join', userData)
      console.log(`userData: ${userData}, response: ${response}`)
      return response
   } catch (err) {
      console.error(`API Request 오류: ${err.message}`)
      throw err
   }
}

// 로그인
export const loginUser = async (credential) => {
   try {
      console.log('credential:', credential)
      const response = await snsApi.post('/auth/login', credential)
      console.log('response:', response)

      return response
   } catch (error) {
      console.error(`API Request 오류: ${error.message}`)
      throw error
   }
}

// 로그아웃
export const logoutUser = async () => {
   try {
      const response = await snsApi.get('/auth/logout')
      return response
   } catch (error) {
      console.error(`API Request 오류: ${error.message}`)
      throw error
   }
}

// 로그인 상태 확인
export const checkAuthStatus = async () => {
   try {
      const response = await snsApi.get('/auth/status')
      return response
   } catch (error) {
      console.error(`API Request 오류: ${error.message}`)
      throw error
   }
}
