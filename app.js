var express = require('express');
const https = require('https');
const fs = require('fs');
var bodyParser = require('body-parser');
var app = express();
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var secret = "my_secret";

var pool = mysql.createPool({

  host     : 'localhost',
  user     : 'app',
  password : 'test123',
  database : 'mydb'
});

var jsonParser = bodyParser.json();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views',__dirname + '/dist');
app.use('/', express.static(__dirname +'/dist', { index: false }));

app.use('/node_modules',  express.static(__dirname + '/node_modules'));
app.use('/style',  express.static(__dirname + '/style'));


app.get('/*', (req, res) => {
   res.render('./index', {req, res});
});


var rolePromise = function(result) {
  return new Promise((resolve, reject) => {
	 pool.getConnection(function(err, conn) {
        if (err) throw err;
        conn.query('SELECT id FROM user_role WHERE users_id=?',[result[0].id], function (err, result1, fields) {
            conn.release();
            if (err){
				 reject("failure reason"); 
			}
			//any roles?
			if(result1[0]){
				//add the role to the resolve param
				//only one role to one user
				//roles do not intercept, just the first role is acknowledged
				result[0]["role"]=result1[0]["id"];
				resolve(result);
			}
			else{
				reject("No roles"); 
			}
        });
      });
	  });
}

app.post('/signin', jsonParser, function(req,res){
    if(!req.body.user || !req.body.pass){
        res.sendStatus(401);
    }
    else{
        var myFirstPromise = new Promise((resolve, reject) => {		
            pool.getConnection(function(err, conn) {
            if (err) throw err;
            conn.query('SELECT * FROM users WHERE name=? AND pass=SHA2(?, 256)',[req.body.user,req.body.pass], function (err, result, fields) {
                conn.release();
                if (err){
                    reject("failure reason"); 
                }
                if(result){
                    resolve(result);
                }
            });
        })
        }).then(result=>{	
        //get role
        rolePromise(result)
        .then((result)=>{	
            console.log(result);		 
            //create&sign jwt and send token
            //one role per user
            var r=result[0];

            //token for app_user should never expire
            //TODO check actual role name
            if(r.role==3){
                jwt.sign({
                    user:r.name,
                    id:r.id,
                    role:r.role
                    }, secret, {},function(err, token) {
                        if (err)
                            throw error;
                        res.send(token);
                    });		
            }
            else{
                jwt.sign({
                    user:r.name,
                    id:r.id,
                    role:r.role
                    }, secret, { expiresIn: '1h' },function(err, token) {
                        if (err)
                            throw error;
                        res.send(token);
                    });		
            }
              
                
        }).catch(error=>{
            console.log(error);
            res.status(401).json({
                failed: 'Unauthorized Access'
            });
        });
        
        
        }).catch(error=>{
            console.log(error);
            res.sendStatus(401);
        });	
    }
    
});	

//does the user have the access to the resource?
//as the role is written to jwt, any role database changes will affect after new jwt with updated rights is asked for
//always call verify before sending data!
function access(req,res, resource, callback){
	//verify the user and get user data: role, id
    verify(req,res, (decoded)=>{
		console.log(decoded);
		//check the database  
		pool.getConnection(function(err, conn) {
        if (err) throw err;
            //app_users have unlimited access
            //TODO check actual role name
            if(decoded.role==3){
                callback();
            }
            else{
                //other users roles check
                conn.query("SELECT count(*) as count FROM roles_has_resources WHERE roles_id="+decoded.role, function (err, result, fields) {
                    conn.release();
                    if (err) throw err;
                    if(result[0] && result[0]["count"]==1){
                        callback();
                    }
                    else{
                        console.log("access denied");
                    res.status(401).json({
                            failed: 'Unauthorized Access'
                        });
                    }
                });
            }
          
		  });
	});		  
}

function verify(req,res, callback){
	//console.log(req.headers.authorization);
	if(req.headers.authorization!=undefined){
		
	let token=req.headers.authorization.split(' ')[1];
	jwt.verify(token, secret, function(err, decoded){
		if(err){
			console.log(err);
			  res.status(401).json({
            failed: 'Unauthorized Access'
         });
		}
		else if(decoded) {
			return callback(decoded);
         }
	})
	}
	else{
         res.status(401).json({
            failed: 'Unauthorized Access'
         });
	}
}

//test function -  always call verify before sending data!
app.post('/verify', function(req,res){	
	//console.log(req.originalUrl);
	access(req,res, '/airplanes', ()=>{
		var results=[1,2,3,4,5,6]
		   res.status(200).json({
			   data: results
            });
	});
		
})
  
app.get('/',function(req,res){
    res.sendFile('home.html',{'root': __dirname + '/templates'});
})

app.get('/dashboard',function(req,res){
 
    pool.getConnection(function(err, conn) {
        if (err) throw err;
        conn.query("SELECT * FROM airplanes", function (err, result, fields) {
            conn.release();
          if (err) throw err;
          //console.log(result);
          //var jsonContent = JSON.parse(result);
          //res.writeHead(200, {'Content-Type': 'application/json'});
          //console.log("Name:", jsonContent.name);
          res.send(JSON.stringify(result));
        });
      });

      //res.sendFile('dashboard.html',{'root': __dirname + '/templates'});   
})

app.post('/airplanes',function(req,res){
	//TODO verify();
	access(req,res, req.originalUrl, ()=>{
		   pool.getConnection(function(err, conn) {
        if (err) throw err;
        conn.query("SELECT * FROM airplanes", function (err, result, fields) {
            conn.release();
          if (err) throw err;
          res.send(JSON.stringify(result));
        });
      });
	});
    
})

app.get('/test/',function(req,res){{
    res.send("working");
}
})

//get user`s airplanes
/*
app.post('/users/airplanes', jsonParser, function(req,res){
    if (!req.body) return res.sendStatus(400)
    pool.getConnection(function(err, conn) {
        if (err) throw err;
        conn.query("SELECT * FROM airplanes WHERE users_id="+req.body.user_id, function (err, result, fields) {
          conn.release();
          if (err) throw err;
          res.send(JSON.stringify(result));
        });
      });
})
*/


app.post('/stationsByUnits',function(req,res){
    var groups=[];
    pool.getConnection(function(err, conn) {
        if (err) throw err;
        var stations_query="SELECT * FROM stations";
        conn.query(stations_query, function (err, result, fields) {
           conn.release();
            if (err) throw err;                     
            res.send(JSON.stringify(result));       
          });                       
      });
})

app.post('/stationUnits',function(req,res){
    var groups=[];
    pool.getConnection(function(err, conn) {
        if (err) throw err;
        var query="SELECT * FROM station_units";
        conn.query(query, function (err, result, fields) {
           conn.release();
            if (err) throw err;                              
            res.send(JSON.stringify(result));       
          });                       
      });
})


//all states for a station
app.post('/stationStates', jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400)
    var query='SELECT ss.* FROM station_states ss INNER JOIN stations s ON s.id=ss.stations_id WHERE s.id="'+req.body.station_id+'"';
    pool.getConnection(function(err, conn) {
        if (err) throw err;
        conn.query(query, function (err, result, fields) {
           conn.release();
            if (err) throw err;                     
            res.send(JSON.stringify(result));               
        });                       
    });          
  })

///all non-charging states for a station 
app.post('/nonChargingStationStates', jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400)
    var query='SELECT ss.* FROM station_states ss INNER JOIN stations s ON s.id=ss.stations_id WHERE ss.airplanes_id is null AND s.id="'+req.body.station_id+'"';
    pool.getConnection(function(err, conn) {
        if (err) throw err;
        conn.query(query, function (err, result, fields) {
           conn.release();
            if (err) throw err;                     
            res.send(JSON.stringify(result));               
        });                       
    });          
  })

  ///all charging states for a station 
app.post('/chargingStationStates', jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400)
    var query='SELECT ss.* FROM station_states ss INNER JOIN stations s ON s.id=ss.stations_id WHERE ss.airplanes_id is not null AND s.id="'+req.body.station_id+'"';
    pool.getConnection(function(err, conn) {
        if (err) throw err;
        conn.query(query, function (err, result, fields) {
           conn.release();
            if (err) throw err;                     
            res.send(JSON.stringify(result));               
        });                       
    });          
  })

    //all states for a station
app.post('/stationStates', jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400)
    var query='SELECT id, stations_id, timestamp, voltage, current FROM station_states WHERE stations_id="'+req.body.station_id+'"';
    pool.getConnection(function(err, conn) {
        if (err) throw err;
        conn.query(query, function (err, result, fields) {
           conn.release();
            if (err) throw err;                     
            res.send(JSON.stringify(result));               
        });                       
    });          
  })
///all history limited states for a station
  app.post('/stationStatesHistory', jsonParser, function (req, res) {
    if (!req.body || !req.body.station_id || !req.body.history) return res.sendStatus(400);
    var where='';
    switch(req.body.history){
        case "1h": where='AND TIMESTAMPDIFF(hour,timestamp, now())<1';break;
        case "24h": where='AND TIMESTAMPDIFF(day,timestamp, now())<1';break;
        case "1m": where='AND TIMESTAMPDIFF(month,timestamp, now())<1';break;
        case "1y": where='AND TIMESTAMPDIFF(year,timestamp, now())<1';break;
        default: where='AND TIMESTAMPDIFF(day,timestamp, now())<1'
    }
    var query='SELECT id, stations_id, CONVERT_TZ(timestamp,"-02:00","+00:00") as timestamp, voltage, current '+
            'FROM station_states WHERE stations_id="'+req.body.station_id+'" '+where;
    pool.getConnection(function(err, conn) {
        if (err) throw err;
        conn.query(query, function (err, result, fields) {
           conn.release();
            if (err) throw err; 
                res.send(JSON.stringify(result));               
        });                       
    });          
  })


      ///last state for all stations
app.post('/lastStationStates', jsonParser, function (req, res) {
    var query="SELECT id, s.stations_id, CONVERT_TZ(s.timestamp,'-00:00','+00:00') as timestamp, s.voltage, s.current"+
    " FROM station_states s"+
    " where s.timestamp="+
    " ("+
    " SELECT max(a.timestamp)"+
    " FROM station_states a"+
    " where a.stations_id=s.stations_id"+
    " )"+
    " group BY s.stations_id";
    //var query='SELECT id, stations_id, CONVERT_TZ(timestamp,"-02:00","+00:00") as timestamp, voltage, current FROM station_states GROUP BY station_states.stations_id;';
    pool.getConnection(function(err, conn) {
        if (err) throw err;
        conn.query(query, function (err, result, fields) {
           conn.release();        
            if (err) throw err;     
            res.send(JSON.stringify(result));               
        });                       
    });          
  })

  app.post('/lastStationStatesUpdate', jsonParser, function (req, res) {
    var query='SELECT id, stations_id, CONVERT_TZ(timestamp,"-02:00","+00:00") as timestamp, voltage, current FROM station_states where date_format(from_unixtime( UNIX_TIMESTAMP(timestamp)),"%Y-%m-%d %H:%i:%S") >"'+req.body.timestamp+'" GROUP BY station_states.stations_id';
    pool.getConnection(function(err, conn) {
        if (err) throw err;
        conn.query(query, function (err, result, fields) {
           conn.release();        
            if (err) throw err;     
            res.send(JSON.stringify(result));               
        });                       
    });          
  })


// Binding express app to port 3000
/*app.listen(3000,function(){
    console.log('Node server running @ http://localhost:3000/')
});*/

var privatekey=fs.readFileSync('C:/Certs/server-key.pem');
var serverCert=fs.readFileSync('C:/Certs/server-cert.pem');

const options = {
    key: privatekey,
    cert: serverCert
  };
  https.createServer(options, app).listen(3000, function(){
  });



