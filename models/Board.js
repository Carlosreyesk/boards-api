const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var boardSchema = Schema({
  _owner   : { type: Schema.Types.ObjectId, ref: 'User' },
  title    : String,
  members  : [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lists    : [{ type: Schema.Types.ObjectId, ref: 'List' }]
});


const Board = mongoose.model('Board', boardSchema);

module.exports = Board;