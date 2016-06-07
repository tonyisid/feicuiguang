var _ = require('lodash');
var logger = require('../../lib/logger.lib');
var commentService = require('../services/comment.service');
var contentsModel = require('../models/content.model');
var commentsModel = require('../models/comments.model');

exports.create = function(req, res, next) {
  req.checkBody({
    'content': {
      notEmpty: {
        options: [true],
        errorMessage: 'content 不能为空'
      },
      isMongoId: { errorMessage: 'content 需为 mongoId' }
    },
    'comment': {
      notEmpty: {
        options: [true],
        errorMessage: 'comment 不能为空'
      },
      isString: { errorMessage: 'comment 需为字符串' }
    }
  });

  if (req.validationErrors()) {
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }

  var _id = req.body.content;
  contentsService.one({_id : _id}, function(err, content){
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }
    var data = {
      content : _id,
      comment : req.body.comment,
      user : req.session.user
    }
    var options = {};
    options.data = data;
    commentService.save(options, function(err, result){
      if (err) {
        logger[err.type]().error(__filename, err);
        return res.status(500).end()
      }
      res.status(204).end();
    })
  })
}

exports.delete =  function (req, res, next) {
  req.checkParams({
    '_id' : {
      notEmpty: {
        options: [true],
        errorMessage: '_id 不能为空'
      },
      isMongoId: { errorMessage: '_id 需为 mongoId' }
    }
  })
  if (req.validationErrors()){
    logger.system().error(__filename, '参数验证失败', req.validationErrors());
    return res.status(400).end();
  }
  commentService.remove({_id : req.params._id}, function(err, result){
    if (err) {
      logger[err.type]().error(__filename, err);
      return res.status(500).end();
    }
    res.status(204).end();
  })
}
