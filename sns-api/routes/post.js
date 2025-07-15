const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { Post, Hashtag, User } = require('../models')
const { isLoggedIn } = require('./middlewares')
const { create } = require('../models/user')

// uploads 폴더가 없을 경우 폴더 생성
try {
   fs.readdirSync('uploads') // uploads라는 이름의 디렉토리가 존재하는지 확인
} catch (error) {
   console.log('경로가 존재하지 않으므로 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads')
}

// 이미지 업로드를 위한 multer 설정
const upload = multer({
   // 저장할 위치와 파일명 지정
   storage: multer.diskStorage({
      destination(req, file, cb) {
         cb(null, 'uploads/') // uploads 폴더에 파일 저장
      },
      filename(req, file, cb) {
         // 제주도.jpg
         const decodeFileName = decodeURIComponent(file.originalname) // 파일명 디코딩(한글 파일명 깨짐 방지)
         const ext = path.extname(decodeFileName) // 확장자 추출 -> .jpg
         const basename = path.basename(decodeFileName, ext) // 확장자 제거한 파일명 추출 -> 제주도

         // 파일명: 기존이름 + 업로드 날짜시간 + 확장자
         // 제주도.jpg
         // 제주도 + 1211242432 + .jpg
         // 제주도1211242432.jpg
         cb(null, basename + Date.now() + ext)
      },
   }),
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 파일크기 제한
})

// 게시물 등록
//req 주소: localhost:8000/post/:id
//<input type='file' name='img'>
router.post('/', isLoggedIn, upload.single('img'), async (req, res, next) => {
   try {
      console.log('💾파일 정보:', req.file)
      console.log('✨formData', req.body)

      if (!req.file) {
         //업로드한 파일이 없다면
         const error = new Error('파일 업로드에 실패했습니다.')
         error.status = 400
         return next(error)
      }

      // 게시물 등록
      const post = await Post.create({
         content: req.body.content,
         img: `/${req.file.filename}`, // 이미지 url (파일명) =>
         user_id: req.user.id, // 작성자 id (PK)
      })

      // 해시태그 등록
      // req.body.hashtags = '#여행 #맛집' 이런 식으로 넘어옴 (프론트엔드로부터!)
      const hashtags = req.body.hashtags.match(/#[^\s#]*/g) // 정규표현식 사용해 #을 기준으로 해시태그 추출
      // 위 정규표현식으로 추출한 결과값: ['#여행', '#맛집'] <- 배열 형태!
      if (hashtags) {
         //추출된 해시태그가 있다면
         /*
         findOrCreate = where절에서 찾는 값이 존재하는지 확인하고 없다면 Create(생성)
         해당 코드에서는 map()함수 안에서 비동기적으로 여러번 실행되는 구조

         Promise.all 처리하면 findOrCreate()함수는 비동기+병렬 처리(동시작업)되므로 작업 속도가 빨라짐
         *주의사항!!* Promise.all 과정에 포함된 함수 중 하나라도 작업에 실패할 시 전체가 rejected됨
         */

         const result = await Promise.all(
            hashtags.map((tag) =>
               Hashtag.findOrCreate({
                  where: { title: tag.slice(1) }, //#을 제외한 문자만
               })
            )
         )
         //postHashtag 테이블에 insert
         /*
          HashTagInstance1 = {
            id:1, 
            title: 여행,
            createAt: '2024-12-16T10:10:10'
            updateAt: '2024-12-16T10:10:10'
          },
           HashTagInstance2 = {
            id:2, 
            title: 맛집,
            createAt: '2024-12-16T10:10:10'
            updateAt: '2024-12-16T10:10:10'
          }
          result = [
            [HashTagInstance1, true] // #여행 해시 태그가 새로 생성됨(false 라면 이미 존재하는 해시태그)
            [HashTagInstance2, true] // #맛집 해시 태그가 새로 생성됨
          ]
          */

         //연관메서드 addHashtags(): HashTagInstance 값을 이용해 hashtag 객체를 insert => 이 과정에서 postHashtag 테이블의 post_id와 hashtag_id 컬럼에 값이 자동으로 insert
         await post.addHashtags(
            result.map((r) => {
               console.log(r)
               return r[0]
            })
         )
      }

      res.status(200).json({
         success: true,
         message: '게시물이 성공적으로 등록됐습니다.',
         post: {
            id: post.id,
            content: post.content,
            img: post.img,
            user: post.user_id,
         },
      })
   } catch (error) {
      error.status = 500
      error.message = '게시물 등록 중 오류가 발생했습니다.'
      next(error)
   }
})

//게시물 수정 localhost:8000/post/:id
router.patch('/:id', isLoggedIn, upload.single('img'), async (req, res, next) => {
   try {
   } catch (error) {
      error.status = 500
      error.message = '게시물 수정 중 오류가 발생했습니다.'
      next(error)
   }
})

//게시물 삭제 localhost:8000/post/:id
router.delete('/:id', isLoggedIn, async (req, res, next) => {
   try {
   } catch (error) {
      error.status = 500
      error.message = '게시물 삭제 중 오류가 발생했습니다.'
      next(error)
   }
})

//특정 게시물 불러오기 (id로 게시물 조회) localhost:8000/post/:id
router.get('/:id', async (req, res, next) => {
   try {
   } catch (error) {
      error.status = 500
      error.message = '특정 게시물을 불러오는 중 오류가 발생했습니다.'
      next(error)
   }
})

//전체 게시물 불러오기 (페이징 기능 포함) localhost:8000/post?page=1&limit=3
router.get('/:id', async (req, res, next) => {
   try {
      const page = parseInt(req.query.page, 10) || 1 // 쿼리스트링의 page(페이지 번호)를 호출, 기본값 1
      const limit = parseInt(req.query.limit, 10) || 3 // 쿼리스트링의 limit(게시글 노출 수) 호출, 기본값 3
      // parseInt (값, 10) -> 10진수로 변환한 값을 반환. 쿼리스트링은 문자열이라서 parseInt로 십진수 숫자값으로 변환해주는거임
      const offset = (page - 1) * limit //오프셋 계산
      /*
      오프셋offset이란?
      페이징 기능 구현할 때 반드시 필요함! 오프셋 계산식은 고정이니까 그냥 외우기
      계산한 오프셋값의 개수만큼 데이터를 생략하고 오프셋+1 번째 데이터부터 보여줌
      */

      // 1. 게시물 레코드의 전체 갯수 카운팅
      // select count(*) from posts
      const count = await Post.count()

      // 2. 게시물 레코드 직접 호출
      const posts = await Post.findAll({
         limit,
         offset,
         order: [['createdAt', 'DESC']], // 포스트 등록일을 기준으로 DESC(내림차순) 정렬 (최근날짜순으로 가져오기 위해서)
         // page:1, limit:3, offset:1 => select * from posts order by createdAt desc limit 3 offset 0
         // page:2, limit:3, offset:3 => select * from posts order by createdAt desc limit 3 offset 3

         //게시글 작성한 사람과 게시글에 포함된 해시태그를 함께 가져온다
         include: [
            {
               model: User,
               attributes: ['id', 'nick', 'email'], // User모델의 id, nick, email값
            },
            {
               model: Hashtag,
               attributes: ['title'], // Hashtag 모델의 title값 호출
            },
         ],
      })
   } catch (error) {
      error.status = 500
      error.message = '게시물을 불러오는 중 오류가 발생했습니다.'
      next(error)
   }
})

module.exports = router
