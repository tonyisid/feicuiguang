var mongoose = require('mongoose');

// 评论模型
var commentsSchema = new mongoose.Schema({
  comment: String,
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contents',
    required: true
  },
  // 发布人
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  //日期
  date: {
    type: Date,
    default: Date.now
  },
  // 放入回收站
  deleted: {
    type: Boolean,
    default: false
  },
})

module.exports = mongoose.model('Comments', commentsSchema);
