const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var listSchema = new Schema({
  _list       : { type: Schema.Types.ObjectId, ref: 'List' },
  title       : String,
  description : String,
  members     : [{ type: Schema.Types.ObjectId, ref: 'User' }],
  position    : Number
});


const List = mongoose.model('Card', listSchema);

module.exports = List;