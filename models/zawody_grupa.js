var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tableSchema = Schema({
    id_zawody: String,
	id_grupa: String
});
module.exports = mongoose.model('zawody_grupa', tableSchema);