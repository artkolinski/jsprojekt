var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var groupSchema = Schema({
	sedziowie: [{type: Schema.Types.ObjectId, ref: 'account'}],
	listastartowa: [{type: Schema.Types.ObjectId, ref: 'element.listy.startowej'}],
    nazwa: String,
    plec: String,
	oceniona: Boolean,
    aktywna: Boolean
});
module.exports = mongoose.model('grupa', groupSchema);