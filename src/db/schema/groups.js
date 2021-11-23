const mongoose = require('../MongoConnection');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true},
    admin: { type: String, required: true},
    members: {type: Array, required: true},
    expenses: {type: Array, required: true},
    is_archived: {type: Boolean, required: true, default: false}
})

const groupModel = mongoose.model('group', groupSchema);

module.exports = groupModel;