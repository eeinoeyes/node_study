const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('../models/user')

// 로그인 시 사용자 정보를 DB에서 조회하고 사용자 존재 여부 확인 및 비밀번호 비교(인증과정)
module.exports = () => {
   passport.use(
      // passport도 미들웨어라서 use 쓰면 됨!!
      new LocalStrategy(
         {
            // input태그에서 name으로 사용하는 이름 지정
            usernameField: 'email',
            passwordField: 'password',
         },

         //실제 로그인 인증 로직
         // 파라미터: 비교에 필요한 요소들(사용자 입력값) + done
         async (email, password, done) => {
            try {
               //1. 입력받은 이메일값으로 사용자 존재 여부 확인
               const exUser = await User.findOne({ where: { email } })

               //2-1. 이메일에 해당하는 사용자가 있을 경우 비밀번호 대조
               if (exUser) {
                  const result = await bcrypt.compare(password, exUser.password)
                  if (result) {
                     //3-1. 비밀번호가 일치하는 경우 사용자 객체를 passport에 반환
                     done(null, exUser)
                  } else {
                     //3-2. 일치하지 않는 경우 message를 passport에 반환
                     done(null, false, { message: '비밀번호가 일치하지 않습니다.' })
                  }
               } else {
                  // 2-2. 이메일에 해당하는 사용자가 없는 경우
                  done(null, false, { message: '가입되지 않은 회원입니다.' })
               }
            } catch (err) {
               console.log(err)
               done(err) // passport에 에러 객체 전달 -> 이후 passport에서 에러 미들웨어로 전달
            }
         }
      )
   )
}
