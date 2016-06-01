var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tableSchema = Schema({
    typ: Number,
    glowa: Number,
	kloda: Number,
	nogi: Number,
	ruch: Number
});
module.exports = mongoose.model('ocena', tableSchema);