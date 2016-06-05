var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tableSchema = Schema({
    id_horse: {type: Schema.Types.ObjectId, ref: 'horses'},
	id_ocena: {type: Schema.Types.ObjectId, ref: 'ocena'},
	id_sedzia: {type: Schema.Types.ObjectId, ref: 'account'}
});
module.exports = mongoose.model('ocena_sedziego', tableSchema);