const express = require('express')
const path = require('path') // 경로 처리 유틸리티
const cookieParser = require('cookie-parser') // 쿠키 처리 미들웨어
const morgan = require('morgan') // HTTP 요청 로깅 미들웨어
const session = require('express-session') // 세션 관리 미들웨어
const passport = require('passport') // 인증 미들웨어

require('dotenv').config() // 환경 변수 관리
const cors = require('cors') // cors 미들웨어 : ★★★ API서버는 반드시!!!! 설정해야함

// 라우터 및 기타 모듈 불러오기
const indexRouter = require('./routes')
const authRouter = require('./routes/auth')
const postRouter = require('./routes/post')
const pageRouter = require('./routes/page')
const userRouter = require('./routes/user')
const { sequelize } = require('./models') // = ./models/index.js
const passportConfig = require('./passport')

const app = express()
passportConfig()
app.set('port', process.env.PORT || 8002)

// 시퀄라이즈를 사용한 DB연결
sequelize
   .sync({ force: false }) // DB에 이미 존재하는 테이블을 삭제하고 새로 생성할지 여부 지정
   .then(() => {
      console.log('DB 연결 성공')
   })
   .catch((err) => {
      console.error(err)
   })

// 미들웨어 설정

app.use(
   cors({
      origin: 'http://localhost:5173', // 특정 주소만 req 허용 (프론트엔드 주소)
      credentials: true, // 쿠키, 세션 등 인증 정보 허용
   })
)
app.use(morgan('dev')) // 로그
app.use(express.static(path.join(__dirname, 'uploads'))) // 정적 파일 제공
app.use(express.json()) // JSON 데이터 파싱
app.use(express.urlencoded({ extended: false })) // URL-encoded 데이터 파싱
app.use(cookieParser(process.env.COOKIE_SECRET)) //쿠키 설정

//세션 설정
app.use(
   session({
      resave: false, //세션 데이터가 변경사항이 없어도 재저장 할지 여부 -> 변경사항이 있어야 재저장
      saveUninitialized: true, //초기화 되지 않은 세션 저장 여부 -> 초기화 되지 않은 빈 세션도 저장
      secret: process.env.COOKIE_SECRET, //세션 암호화 키
      cookie: {
         // maxAge를 설정하지 않으면 브라우저가 꺼지면 쿠키도 삭제됨
         httpOnly: true, //javascript로 쿠키에 접근가능한지 여부 -> true 일경우 접근 X
         secure: false, //https를 사용할때만 쿠키 전송 여부 -> http, https 둘다 사용가능
      },
   })
)

//passport 초기화, 세션 연동
app.use(passport.initialize()) // 초기화
app.use(passport.session()) // passport와 생성해둔 세션 연결

// 라우터 등록
app.use('/', indexRouter) // localhost:8000/
app.use('/auth', authRouter) // localhost:8000/auth
app.use('/post', postRouter) // localhost:8000/post
app.use('/page', pageRouter) // localhost:8000/page
app.use('/user', userRouter) // localhost:8000/user

// 잘못된 라우터 경로 처리
app.use((req, res, next) => {
   const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`) //에러객체 생성
   error.status = 404 // 404 상태코드 설정
   next(error) //에러 미들웨어로 전달
})

// 에러 미들웨어
app.use((err, req, res, next) => {
   console.error(err)

   const statusCode = err.status || 500
   const errorMessage = err.message || '서버 내부 오류'

   // 클라이언트에 에러 json 객체 response
   res.status(statusCode).json({
      success: false, // 성공여부(필수 값 X)
      message: errorMessage, // 에러메세지
      error: err, // 에러 객체
   })
})

app.listen(app.get('port'), () => {
   console.log(`${app.get('port')}번 포트에서 대기중`)
})
