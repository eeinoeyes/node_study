// 로그인 상태 확인 미들웨어 : 사용자가 로그인 된 상태인지 확인하는 미들웨어
exports.isLoggedIn = (req, res, next) => {
   if (req.isAuthenticated()) {
      next()
   } else {
      const error = new Error('로그인이 필요합니다.')
      error.status = 403
      return next(error)
      // 로그인 되지 않은 경우 에러미들웨어로 보냄
   }
}

// 비로그인 상태 확인 미들웨어 : 사용자가 로그인 안 된 상태인지 확인
exports.isNotLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
      //로그인이 되지 않았을 경우 다음 미들웨어로 이동
      next()
   } else {
      const error = new Error('이미 로그인 된 상태입니다.')
      error.status = 400
      return next(error)
   }
}
