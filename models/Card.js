const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var cardSchema = new Schema({
  _list       : { type: Schema.Types.ObjectId, ref: 'List' },
  title       : String,
  description : String,
  members     : [{ type: Schema.Types.ObjectId, ref: 'User' }],
  duedate     : Date,
  labels      : [{ type: Schema.Types.ObjectId, ref: 'Label' }],
  attachments : [String],
  comments    : [{ type: Schema.Types.ObjectId, ref: 'Comment'}]
});


const Card = mongoose.model('Card', cardSchema);

module.exports = Card;