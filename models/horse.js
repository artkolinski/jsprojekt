var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var playersSchema = Schema({
    nazwa: String,
    plec: String,
    hodowca: String
});
module.exports = mongoose.model('horses', playersSchema);