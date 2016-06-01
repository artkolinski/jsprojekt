var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var groupSchema = Schema({
    nazwa: String,
    plec: String,
	oceniona: Boolean,
    aktywna: Boolean
});
module.exports = mongoose.model('grupa', groupSchema);