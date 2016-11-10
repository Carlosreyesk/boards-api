const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var boardSchema = Schema({
  _owner   : { type: Schema.Types.ObjectId, ref: 'User' },
  title    : String,
  members  : [{ type: Schema.Types.ObjectId, ref: 'User' }],
  columns  : [{ type: Schema.Types.ObjectId, ref: 'List' }],
  labels   : [{ type: Schema.Types.ObjectId, ref: 'Label' }]
});


const Board = mongoose.model('Board', boardSchema);

module.exports = Board;