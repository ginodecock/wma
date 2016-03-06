var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')
var mysql = require('mysql')
var ipaddress = process.env.OPENSHIFT_NODEJS_IP;
var port = process.env.OPENSHIFT_NODEJS_PORT || 7800;
console.log (port);
if (typeof ipaddress === "undefined") {ipaddress = "localhost"};
console.log (ipaddress);
var app = express()
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname,'public')));
app.set('views', path.join(__dirname , '/view'));
app.set('view engine', 'jade');
app.locals.pretty = true;

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


app.get('/',function(req,res) {
	res.render('home')
})

app.get('/getWma',function(req,res) {
	Query('SELECT * FROM wma.stamp;',function(e,data) {
		console.log(data)
		if (!e){
			res.render('wma',{input:data})
		}
		else{
			res.end('error')
		}
	})
})


app.post('/wma',function(req,res) {
	var success = false
	var parsedBody = req.body

		if (parsedBody.chipId && parsedBody.value1){
			var chipId = parsedBody.chipId
			var value1 = parsedBody.value1
			var value2 = parsedBody.value2 || 0
			var value3 = parsedBody.value3 || 0
			var status = parsedBody.status || 'heartbeat'

			var QuerySting = 
			'INSERT INTO wma.stamp (chipID,value1,value2,value3,status) VALUES ('
			+ mysql.escape(chipId) + ',' 
			+ mysql.escape(value1) + ','
			+ mysql.escape(value2) + ','
			+ mysql.escape(value3) + ','
			+ mysql.escape(status) + ') ON DUPLICATE KEY UPDATE chipID = VALUES(chipID),value1 = VALUES(value1),value2 = VALUES(value2),value3 = VALUES(value3),status = VALUES(status);'

			Query(QuerySting,function(e,d) {console.log(e,d)})
		}

	res.end(JSON.stringify(parsedBody,null,'\t'))
})

app.get('/a',function(req,res) {
	res.end('hi')
})


app.listen(port,ipaddress)


/////////////////////////////////////////////////SQL
var host = 'localhost'
var user = 'wma'
var password = 'wma'
var db = 'wma'
var port = 3306

if (process.env.OPENSHIFT_MYSQL_DB_HOST){
	host = process.env.OPENSHIFT_MYSQL_DB_HOST
	user = process.env.OPENSHIFT_MYSQL_DB_USERNAME
	password = process.env.OPENSHIFT_MYSQL_DB_PASSWORD
	db = 'wma'
	port = process.env.OPENSHIFT_MYSQL_DB_PORT

}

var mysql      = require('mysql');
var connection = mysql.createConnection({
  port : port,
  host     : host,
  user     : user,
  password : password,
  database : db
});
 
connection.connect();
connection.on('connect',function() {
	console.log ('connected')
})

var Query = function (Query,cb){
	cb = cb || function() {}
		connection.query(Query,function(err,rows,fields) {
			if (err){
				cb(err,null)
			}
			else{
				cb(null,rows,fields)
			}
		})
}

Query('CREATE TABLE IF NOT EXISTS wma.user ( \
	chipId VARCHAR(50) NOT NULL PRIMARY KEY,\
	email VARCHAR(50),\
	firstName VARCHAR (50),\
	lastName VARCHAR (50)\
);',function(e,data) {console.log(e,data)})

Query('CREATE TABLE IF NOT EXISTS wma.stamp (\
	chipId VARCHAR(50) NOT NULL,\
	value1 DOUBLE NOT NULL,\
	value2 DOUBLE NOT NULL,\
	value3 DOUBLE NOT NULL,\
	status enum (\'loggen\', \'alarm\', \'rebootalert\', \'heartbeat\'),\
	timestamp TIMESTAMP NOT NULL,\
	id int PRIMARY KEY AUTO_INCREMENT,\
	FOREIGN KEY (chipId) REFERENCES wma.user(chipId) ON UPDATE CASCADE ON DELETE RESTRICT\
);',function(e,data) {console.log(e,data)})


Query('INSERT INTO wma.user (chipID,email,firstName,lastName) VALUES \
	(\'QZE3veFv67amb\',\'jeffrey@customBanden.be\',\'Jeffrey\',\'tuning\') \
ON DUPLICATE KEY \
UPDATE chipID =VALUES(chipID),email = VALUES(email),firstName = VALUES(firstName),lastName = VALUES(lastName);',function(e,data) {console.log(e,data)})



/*
//{"chipId":"QZE3veFv67amb","value1":180,"value2":190,"value3":8.55}// dd
*/
