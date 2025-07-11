const express = require('express')
const passport = require('passport')
const bcrypt = require('bcrypt')
const router = express.Router()
const User = require('../models/user')

// 회원가입 기능 구현 : localhost:8000/auth
router.post('/join', async (req, res, next) => {
   try {
      const { email, nick, password } = req.body
      /*
       req.body 는 json객체 데이터고 
       email: req.body.email,
       nick: req.body.nick 이런 식으로 오니까 비구조화할당으로 정의하면 빠름
       */

      //이메일로 기존 사용자 존재여부 검색
      //select * from users where email = ? limit 1;
      const exUser = await User.findOne({
         where: { email }, //email: email과 같음! 생략 가능~
      })
      // 이미 해당 이메일을 가진 유저가 존재하는 경우
      if (exUser) {
         // HTTP 409 Conflict 응답 상태 코드는 서버의 현재 상태와 요청이 충돌했음을 나타냅니다.
         // return res.status(409).json({
         //    success: false,
         //    message: '중복된 이메일입니다',
         // })
         const error = new Error('이미 존재하는 사용자입니다.')
         error.status = 409 // Conflict
         return next(error) // 에러 미들웨어로 이동
      }
      // 이메일 중복 확인시 새로운 계정 생성
      // password는 민감한 데이터이므로 암호화 진행 후 저장
      const hash = await bcrypt.hash(password, 12) //12는 salt값! (데이터에 추가되는 임의의 난수, 10~12정도의 값 권장)

      const newUser = await User.create({
         email,
         nick,
         password: hash,
      })

      //성공 응답 반환
      res.status(201).json({
         success: true,
         message: '계정 생성 성공',
         user: {
            id: newUser.id,
            email: newUser.email,
            nick: newUser.nick,
         },
      })
   } catch (error) {
      error.status = 500
      error.message = '회원가입 중 오류가 발생했습니다.'
      next(error)
   }
})

// 로그인: localhost:8000/auth/login
// 얘만 post고 밑으로는 다 get!
router.post('/login', async (req, res, next) => {
   /* 
   authenticate : localStrategy.js에 작성한 인증 과정을 실행시킴
                  그 과정에서 에러 발생시 authError객체에 값을 부여하고,
                  인증 성공시 user 파라미터에는 passport에서 넘겨받은 exUser값 저장
   */
   passport.authenticate('local', (authError, user, info) => {
      if (authError) {
         // 로그인 인증 중 에러 발생시
         authError.status = 500
         authError.message = '인증 중 오류 발생'
         return next(authError) // 에러 미들웨어로 이동
      }
      if (!user) {
         //비밀번호 불일치 or 사용자 없을 경우 info.message에 메시지 전달
         /*
         info 값으로는 localStrategy에서 done에서 null, false와 함께 보낸 message 객체가 들어있음
         */
         const error = new Error(info.message || '로그인 실패')
         error.status = 401 // Unauthorized
         return next(error)
      }

      // 인증이 정상적으로 되고 사용자를 로그인 상태로 바꿈
      req.login(user, (loginError) => {
         // 로그인 과정 중 에러 발생(loginError)시
         if (loginError) {
            loginError.status = 500
            loginError.message = '로그인 중 오류 발생'
            return next(loginError)
         }
      })

      // 로그인 성공시 user객체와 함께 response
      res.status(200).json({
         success: true,
         message: '로그인 성공',
         user: {
            id: user.id,
            nick: user.nick,
         },
      })
   })(req, res, next)
})

// 로그아웃: localhost:8000/auth/logout
router.get('/logout', async (req, res, next) => {
   req.logOut((logoutError) => {
      if (logoutError) {
         // 로그아웃으로 상태 변경 도중 에러 발생시
         logoutError.status = 500
         logoutError.message = '로그아웃 중 오류 발생'
         return next(logoutError)
      }

      // 로그아웃 성공시 res
      // 이때 세션에 저장돼 있던 사용자 id는 삭제된다
      res.status(200).json({
         success: true,
         message: '로그아웃 완료',
      })
   })
})

// 현재 로그인 상태 확인: localhost:8000/auth/status
router.get('/status', async (req, res, next) => {
   try {
      if (req.isAuthenticated()) {
         // isAuthenticated: 인증 여부 확인. true일시 로그인 상태, false일시 로그아웃 상태
         res.status(200).json({
            isAuthenticated: true,
            user: {
               // req.user = passport에서 역직렬화 설정에 의해 로그인 되었을 때 로그인한 user정보
               id: req.user.id,
               nick: req.user.nick,
            },
         })
      } else {
         res.status(200).json({
            isAuthenticated: false,
         })
      }
   } catch (error) {
      error.message = '로그인 상태 확인 중 오류가 발생했습니다.'
      error.status = 500
      next(error)
   }
})

module.exports = router
