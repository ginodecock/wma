// load the things we need
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
// define the schema for our user model
var sensorSchema = mongoose.Schema({
    sensorId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    timestamp: { type: Date, 'default': Date.now },
    user_id: {type: ObjectId}
});
module.exports = mongoose.model('Sensor', sensorSchema);
