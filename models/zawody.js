var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tableSchema = Schema({
	nazwa: String,
    liczbasedziow: Number,
    ocena: String,
	aktywne: Boolean,
	zakonczone: Boolean,
	grupy: [{type: Schema.ObjectId, ref: 'grupa'}]
});
module.exports = mongoose.model('zawody', tableSchema);