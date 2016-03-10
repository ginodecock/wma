var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')
var ipaddress = process.env.OPENSHIFT_NODEJS_IP;
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
console.log (port);
if (typeof ipaddress === "undefined") {ipaddress = "192.168.168.29"};
console.log (ipaddress);
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var Sensorlog = require('./app/models/sensorlog');

var app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

//app.set('views', path.join(__dirname , '/view'));
app.set('view engine', 'ejs');
app.locals.pretty = true;

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session



// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/wma';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}
console.log(connection_string);
var mongojs = require('mongojs');
var db = mongojs(connection_string, ['books']);
var books = db.collection('books');
// similar syntax as the Mongo command-line interface
// log each of the first ten docs in the collection
db.books.find({}).limit(10).forEach(function(err, doc) {
  if (err) throw err;
  if (doc) { console.dir(doc); }
});

mongoose.connect(connection_string);
require('./config/passport')(passport); // pass passport for configuration
//require('./app/models/sensorlog')(Sensorlog);

app.post('/wma',function(req,res) {
	var success = false
	var parsedBody = req.body
		if (parsedBody.chipId && parsedBody.value1){
			var chipId = parsedBody.chipId;
			var value1 = parsedBody.value1;
			var value2 = parsedBody.value2 || 0;
			var value3 = parsedBody.value3 || 0;
			var status = parsedBody.status || 'heartbeat';
			var currentDate = new Date();
			var logNow = new Sensorlog({
				sensorId: chipId,
				value1: value1,
				value2: value2,
				value3: value3,
				status: status,
				timestamp: currentDate
			});
			logNow.save(function(err) {
  				if (err) throw err;
  				console.log('Sensorlog saved successfully!');
			});
		}
	res.json(req.body);
	//res.end(JSON.stringify(parsedBody,null,'\t'))
})


app.get('/a',function(req,res) {
	//sleep(2000);
	//
	res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('get received');
})

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.listen(port,ipaddress)


/////////////////////////////////////////////////SQL

/*
//{"chipId":"QZE3veFv67amb","value1":180,"value2":190,"value3":8.55}// dd
*/
console.log('The magic happens on port ' + port);
