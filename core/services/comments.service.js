var async = require('async');
var _ = require('lodash');
var marked = require('marked');
var logger = require('../../lib/logger.lib');
var moment = require('moment');
var categories = require('../models/categories.model');
var contentsModel = require('../models/contents.model');
var mediaModel = require('../models/media.model');
var commentsModel = require('../models/comments.model')

/**
 * 单条内容
 * @param {Object} options
 *        {MongoId} options._id
 *        {String} options.status
 *        {String} options.alias
 *        {Boolean} options.reading
 * @param {Function} callback
 */
exports.one = function (options, callback) {
  var query = {};
  var reading = true;
  var markdown = false;

  if (options._id) query._id = options._id;
  if (options.status) query.status = options.status;
  if (options.alias) query.alias = options.alias;
  if (_.isBoolean(options.reading)) reading = options.reading;
  if (_.isBoolean(options.markdown)) markdown = options.markdown;

  commentsModel.findOne(query)
    .select('comment content user date deleted')
    .populate('content', 'title user alias')
    .populate('user', 'nickname email')
    .exec(function (err, comment) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      if (!comment) return callback();

      callback(null, comment);
    }
};

/**
 * 多条内容
 * @param {Object} options
 *        {MongoId} options._id
 *        {Boolean} options.deleted
 *        {String|Array} options.type
 *        {Number} options.currentPage
 *        {Number} options.pageSize
 * @param {Function} callback
 */
exports.list = function (options, callback) {
  var query = {};
  var currentPage = 1;
  var pageSize = 50;

  if (options._id) query.content = options._id;
  if (_.isBoolean(options.deleted)) query.deleted = options.deleted;
  if (options.currentPage) currentPage = parseInt(options.currentPage);
  if (options.pageSize) pageSize = parseInt(options.pageSize);

  async.waterfall([
    function (callback) {
      commentsModel.count(query, function (err, count) {
        if (err) {
          err.type = 'database';
          return callback(err);
        }

        if (count) {
          callback(null, count);
        } else {
          callback(null, null);
        }
      });
    },
    function (count, callback) {
      contentsModel.find(query)
        .sort('-date')
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .select('comment content user date deleted')
        .populate('content', 'title alias')
        .populate('user', 'nickname email')
        .exec(function (err, comments) {
          if (err) {
            err.type = 'database';
            return callback(err);
          }
          callback(null, count, comments);
        });
    }
  ], function (err, count, comments) {
    if (err) return callback(err);

    var result = {
      comments: comments,
      pages: Math.ceil(count / pageSize)
    };
    callback(err, result);
  });
};

/**
 * 内容总数
 * @param {Function} callback
 */
exports.total = function (callback) {
  commentsModel.count({}, function (err, count) {
    if (err) {
      err.type = 'database';
      return callback(err);
    }

    callback(null, count);
  });
};

/**
 * 存储内容
 * @param {Object} options
 *        {MongoId} options._id
 *        {String} options.data
 *        {Boolean} options.multi
 * @param {Function} callback
 */
exports.save = function (options, callback) {
  if (!options.data) {
    var err = {
      type: 'system',
      error: '没有 data 传入'
    };

    return callback(err);
  }

  var data = options.data;
  var _id = options._id;
  var ids = options.ids;

  if (ids) {
    commentsModel.update({ $in: { _id: ids } }, data, { multi: true, runValidators: true }, function (err) {
      if (err) {
        err.type = 'database';
        return callback(err);
      }

      callback();
    });
  } else if (_id) {
    commentsModel.findByIdAndUpdate(_id, data, { runValidators: true }, function (err, oldContent) {
      callback(err, oldContent);
    });
  } else {
    new contentsModel(data).save(function (err, content) {
      callback(err, content);
    });
  }
};

/**
 * 删除内容
 * @param {Object} options
 *        {MongoId} options._id
 * @param {Function} callback
 */
exports.remove = function (options, callback) {
  if (!options._id && !options.ids) {
    var err = {
      type: 'system',
      error: '没有 _id 或 ids 传入'
    };

    return callback(err);
  }

  var _id = options._id;
  var ids = options.ids;

  if (ids) {
    commentsModel.remove({$in : {_id : ids}})
  }
};
