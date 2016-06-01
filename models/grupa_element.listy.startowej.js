var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tableSchema = Schema({
    id_element: String,
	id_grupa: String
});
module.exports = mongoose.model('grupa_element.listy.startowej', tableSchema);