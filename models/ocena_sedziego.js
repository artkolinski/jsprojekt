var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tableSchema = Schema({
    id_horse: String,
	id_ocena: String,
	id_sedzia: String
});
module.exports = mongoose.model('ocena_sedziego', tableSchema);