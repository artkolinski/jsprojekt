var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
	imie: String,
    nazwisko: String,
    role: String,
});
Account.plugin(passportLocalMongoose);
module.exports = mongoose.model('Account', Account);
