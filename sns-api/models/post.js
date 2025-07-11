const Sequelize = require('sequelize')

module.exports = class Post extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            content: {
               type: Sequelize.TEXT,
               allowNull: false,
            }, // 글 내용
            img: {
               type: Sequelize.STRING(200),
               allowNull: true,
            }, // 이미지 경로
         },
         {
            sequelize,
            timestamps: true, //createAt, updateAt ..등 자동 생성
            underscored: false,
            modelName: 'Post',
            tableName: 'posts',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
   static associate(db) {
      db.Post.belongsTo(db.User, {
         foriegnKey: 'user_id',
         targetKey: 'id',
      })
      db.Post.belongsToMany(db.Hashtag, {
         through: 'postHashtag',
         foreignKey: 'post_id', // 교차 테이블에서 post 모델의 FK
         otherKey: 'hashtag_id', // hashtag 모델의 FK
      })
   }
}
