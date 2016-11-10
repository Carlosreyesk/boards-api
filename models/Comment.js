const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var commentSchema = new Schema({
  _card       : { type: Schema.Types.ObjectId, ref: 'Card' },
  body        : String,
  author      : { type: Schema.Types.ObjectId, ref: 'User' }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;