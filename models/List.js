const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var listSchema = new Schema({
  _board   : { type: Schema.Types.ObjectId, ref: 'Board' },
  cards    : [{ type: Schema.Types.ObjectId, ref: 'Card'}]
});


const List = mongoose.model('List', listSchema);

module.exports = List;