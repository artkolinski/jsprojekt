var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tableSchema = Schema({
    liczbasedziow: Number,
    ocena: String,
	aktywne: Boolean,
	zakonczone: Boolean
});
module.exports = mongoose.model('zawody', tableSchema);