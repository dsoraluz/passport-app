const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roomSchema = new Schema({
  name: {type: String, required: true},
  desc: String,
  picture: String,
  //and id from the users connection.. a reference to a user in the database.
  owner: {type: Schema.Types.ObjectId, ref: 'User'}
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
