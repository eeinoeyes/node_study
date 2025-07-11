const passport = require('passport')
const local = require('./localStrategy')
const User = require('../models/user')

// passport에 로그인 인증과정 / 직렬화 / 역직렬화 함수 등록
module.exports = () => {
   // 직렬화 (serializeUser): 로그인 성공 후 사용자 정보를 세션에 저장
   passport.serializeUser((user, done) => {
      console.log('⚡⚡', user) // 사용자 정보가 저장돼 있는 객체 조회
      done(null, user.id) // user테이블의 id값을 세션에 저장(세션 용량 절약을 위해 id만 저장)
   })

   // 역직렬화 (deserializeUser): 클라이언트에 req가 올 때마다 세션에 저장된 사용자 id(user 테이블 PK:id컬럼)를 바탕으로 사용자 정보 조회
   passport.deserializeUser((id, done) => {
      // response하고 싶은 사용자 정보 가져옴
      // 여기서 사용하는 id = 위 직렬화에서 저장한 user.id
      User.findOne({
         // DB쿼리문: select id, nick, email, createAt, updateAt from users where id=? limit 1
         where: { id },
         attributes: ['id', 'nick', 'email', 'createAt', 'updateAt'],
      })
         .then((user) => done(null, user)) // 성공시 가져온 사용자 객체 정보 반환
         .catch((err) => done(err)) // 실패(에러 발생)시 에러 반환
   })
   local() // localStrategy.js에서 export한 함수(인증과정 함수)를 passport에 추가
}
