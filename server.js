var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var app = express();
app.use(morgan('combined'));

var config = {
  user: 'dimpu47', //env var: PGUSER 
  database: 'dimpu47', //env var: PGDATABASE 
  password: process.env.DB_PASSWORD, //env var: PGPASSWORD 
  host: 'db.imad.hasura-app.io',
  port: 5432, //env var: PGPORT 
  max: 10, // max number of clients in the pool 
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed 
};




function createTemplate (data) {
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
    var htmlTemplate = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>
                  ${title}
            </title>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <link href="/ui/style.css" rel="stylesheet" />
            
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
            <script src="https://use.fontawesome.com/7f7c7f338a.js"></script>
        </head>
        <body class='bg'>
            <div class="container container-fluid">
                <div class='jumbotron'>
                    <div class="lead">
                    <a href="/">Home</a>
                    </div>
                    <hr/>
                    <h3 class="lead">
                        ${heading}
                    </h3>
                    <div class="lead">
                        ${date.toDateString()}
                    </div>
                    <div class="lead">
                        ${content}
                    </div>
                </div>
                
            </div>
        </body>
    </html>
    `;
    return htmlTemplate;
}


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function hash(input, salt) {
    var hashed = crypto.pbkdf2sync(input, salt, 10000, 512, 'sha512');
    return ['pbkdf2', '10000', salt, hashed.toString('hex')].join('$');
}

app.get('/hash/:input', function (req, res) {
    var hashedString = hash(req.params.input, "random-salt-string");
    res.send(hashedString);
});

app.post("/create-user", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password, result);
    
    pool.query("INSERT INTO 'user' (username, password) WHERE $1 $2", [username, dbString], function (err, results) {
        if (err) {
            res.status(500).send(err.toString());
        } else {
            res.send('User Successfully Created' + username);
        }
    });
});

var pool = new Pool(config);
app.get('/test-db', function (req, res) {
    // make request
    pool.query('SELECT * FROM test', function (err, results) {
       if (err) {
            res.status(500).send(err.toString(''));
       } else { 
            res.send(JSON.stringify(results.rows));
       }
    });

    
    // respond with results
});

var counter=0;
app.get('/counter', function(req,res){
 counter = counter + 1;
 res.send(counter.toString());
});



var names=[];


app.get('/submit-name', function(req, res) {
    // Get the name from the request
    var name = req.query.name;
    names.push(name);
    // JSON
    res.send(JSON.stringify(names));
});


app.get('/articles/:articleName', function(req,res) {
    
    // var articleName = req.params.articleName;
    
    pool.query("SELECT * FROM article WHERE title = $1",[req.params.articleName], function (err, results) {
      
      if (err) {
          res.status(500).send(err.toString());
      } else {
          if (results.rows.length === 0) {
              res.status(404).send('Article Not Found');
              
          } else {
              var articleData = results.rows[0];
              res.send(createTemplate(articleData));
          }
      }
    });
    
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

app.get('/ui/universe.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'universe.jpg'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
