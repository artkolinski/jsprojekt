var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tableSchema = Schema({
    numerstartowy: Number,
    id_horse: { type: String, ref: 'horse' },
	id_ocena: { type: String, ref: 'ocena' },
	id_grupa: { type: String, ref: 'grupa' }
});
module.exports = mongoose.model('element.listy.startowej', tableSchema);