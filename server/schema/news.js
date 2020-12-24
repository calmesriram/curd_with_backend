var mongoose = require('mongoose');
const shortid = require('shortid');
const Schema = mongoose.Schema;
const newsSchema = Schema({
    newsid: {
        'type': String,
        'default': shortid.generate
    },
    username: String,
    name: String,
    description: String,
    image: String
});
module.exports = mongoose.model('News', newsSchema);