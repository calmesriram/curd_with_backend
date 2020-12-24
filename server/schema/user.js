var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: String
});
module.exports = mongoose.model('User', UserSchema);