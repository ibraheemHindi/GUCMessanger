
var express = require('express');
var app = express();
var httpntlm = require('httpntlm');
var cheerio = require('cheerio');
var request = require('request');
var bodyParser = require('body-parser');

var majorToCode = {
	'Computer Science & Engineering' : '1' ,
	'Digital Media Engineering & Technology' : '2' ,
	'Electronics' : '7' ,
	'Communication' : '8' ,
	'Networking' : '10' ,
	'Material Science & Engineering' : '11' ,
	'Mechatronics' : '12' ,
	'Production & Design Technology' : '15' ,
	'Business Informatics' : '16' ,
	'General Management' : '18'
};

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/favicon.ico' , function(req,res){

	res.json({'message' : 'FUCK YOU'});

});	

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next();
});

//Test this at http://localhost:4000/api/authenticate/<email>/<pass>   -----------   http not https please :D

router.route('/authenticate/:e/:p').get(function(req,res){

    var email = req.params.e;
	var pass = req.params.p;

	httpntlm.get({
    url: 'http://student.guc.edu.eg/Student/Default.htm',
    username: email,
    password: pass
	}, function (err, resp){

		if(err) {
			console.log('ERROR');
		    return err;
		}

		if(resp.statusCode == 200){
			res.json({'authenticated' : 'true'});
		}

		else{
			res.json({'authenticated' : 'false'});
		}

	});

});	


//Test this at http://localhost:4000/api/courses/<major>/<semester>

router.route('/courses/:m/:s').get(function(req,res){

	var major = req.params.m;
	var semester = req.params.s;

	var url = 'http://met.guc.edu.eg/Courses/Undergrad.aspx';

    var majorCode = majorToCode[major];
    var arr = ['coursesDiv', majorCode, semester];
    var sectionID = arr.join('');

	request(url, function(error, response, html){

	    if(!error){

	        var $ = cheerio.load(html);

    		$('#'+sectionID).filter(function(){

                var data = $(this);

                var courses = data.children().text();

                res.json({'Courses':courses});

            });

	    }

	    else{
	    	console.log(error);
	    }

	});

});

app.use('/api', router);

app.listen(process.env.PORT || 8080);