var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var groupSchema = Schema({
	sedziowie: [{type: Schema.Types.ObjectId, ref: 'Account'}],
	listastartowa: [{type: Schema.Types.ObjectId, ref: 'element.listy.startowej'}],
	ocenysedziow: [{type: Schema.Types.ObjectId, ref: 'ocena_sedziego'}],
    nazwa: String,
    plec: String,
	oceniona: Boolean,
    aktywna: Boolean
});
module.exports = mongoose.model('grupa', groupSchema);