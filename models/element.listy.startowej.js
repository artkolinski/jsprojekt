var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tableSchema = Schema({
    numerstartowy: Number,
    id_horse: { type: Schema.Types.ObjectId, ref: 'horse' },
	id_ocena: { type: Schema.Types.ObjectId, ref: 'ocena' },
	id_grupa: { type: Schema.Types.ObjectId, ref: 'grupa' }
});
module.exports = mongoose.model('element.listy.startowej', tableSchema);