var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tableSchema = Schema({
    numerstartowy: Number,
    id_horse: String,
	id_ocena: String,
	id_grupa: String
});
module.exports = mongoose.model('element.listy.startowej', tableSchema);