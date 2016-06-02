var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var groupSchema = Schema({
	sedziowie: [{type: Schema.ObjectId, ref: 'Account'}],
	listastartowa: [{type: Schema.ObjectId, ref: 'element.listy.startowej'}],
    nazwa: String,
    plec: String,
	oceniona: Boolean,
    aktywna: Boolean
});
module.exports = mongoose.model('grupa', groupSchema);