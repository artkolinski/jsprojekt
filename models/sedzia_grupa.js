var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tableSchema = Schema({
    id_grupa: String,
    id_sedzia: String,
	czyoceniona: Boolean
});
module.exports = mongoose.model('sedzia_grupa', tableSchema);