const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var labelSchema = new Schema({
  _board      : { type: Schema.Types.ObjectId, ref: 'Board' },
  title       : String,
  color       : String
});


const Label = mongoose.model('Label', labelSchema);

module.exports = Label;