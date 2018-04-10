//Author: Kelvin Lu

var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var request = require('request');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);


//Insert Row into database
app.post('/add', function(req,res,next) {
	//Check if name field is blank
	if (req.body.name == '') {
		req.body.name = null;
	}
	mysql.pool.query('INSERT INTO workouts SET ?', req.body, function(err, result){
		var id;
		if (err) {
			console.error(err.stack);
			res.status(300).send('Invalid add');
			return;
		}
		id = result.insertId;
		mysql.pool.query('SELECT * FROM workouts', function(err,rows, fields){
			if (err) {
				console.error(err.stack);
				res.status(400).send('Invalid select');
				return;
			}
			res.status(200).json(rows);
		});
	});
});

//Delete Row from database
app.post('/delete', function(req,res,next) {
	mysql.pool.query('DELETE FROM workouts WHERE id = ?', [req.body.id], function(err, result){
		if (err) {
			console.error(err.stack);
			res.status(300).send('Invalid delete');
			return;
		}
		id = result.affectedRows;
		mysql.pool.query('SELECT * FROM workouts', function(err,rows, fields){
			if (err) {
				console.error(err.stack);
				res.status(400).send('Invalid select');
				return;
			}
			res.status(200).json(rows);
		});
	});
});


//Edit Row in database
app.post('/edit', function(req,res,next) {
	//Check if name field is blank
	if (req.body.name == '') {
		req.body.name = null;
	}
	//Select the affected row and get current column values
	mysql.pool.query('SELECT * FROM workouts WHERE id = ?', [req.body.id], function(err, result) {
		if (err) {
			console.error(err.stack);
			res.status(300).send('Invalid select');
			return;
		}
		if(result.length == 1) {
			var curr = result[0];
			//Update with new values if available or keep previous if not
			mysql.pool.query('UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ',
				[req.body.name || curr.name, req.body.reps || curr.reps, req.body.weight || curr.weight, req.body.date || curr.date, req.body.lbs, req.body.id],
				function(err,result) {
					if(err){
						console.error(err.stack);
						res.status(400).send('Invalid edit');
						return;
					}
					mysql.pool.query('SELECT * FROM workouts', function(err,rows, fields){
						if (err) {
							console.error(err.stack);
							res.status(400).send('Invalid select');
							return;
						}
						res.status(200).json(rows);
					});
			});
		}
	});
});

//Create new table
app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});


app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://flip3.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});
