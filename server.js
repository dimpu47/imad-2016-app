var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
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

var articles = {
    'article-one': {
        title: 'Article One | Gaurav Choudhary',
        heading: 'Article One',
        date: 'Sep 19, 2019',
        content: `
        <p>
            This is the content of first article from the future. Guess what? There's No apocalypse ! You will live to die into Eternity.
        </p>
        <p>
            This is the content of first article from the future. Guess what? There's No apocalypse ! You will live to die into Eternity.
        </p>
        <p>
            This is the content of first article from the future. Guess what? There's No apocalypse ! You will live to die into Eternity.
        </p>
        `

    },
    'article-two': {
        title: 'Article Two | Gaurav Choudhary',
        heading: 'Article Two',
        date: 'Sep 29, 2019',
        content: `
        <p>
            This is the content of second article from the future. Guess what? There's No apocalypse ! You will live to die into Eternity.
        </p>
        <p>
            This is the content of second article from the future. Guess what? There's No apocalypse ! You will live to die into Eternity.
        </p>
        <p>
            This is the content of second article from the future. Guess what? There's No apocalypse ! You will live to die into Eternity.
        </p>`
    },
    'article-three': {
        title: 'Article Three | Gaurav Choudhary',
        heading: 'Article Three',
        date: 'Sep 20, 2020',
        content: `
        <p>
            This is the content of Third article from the future. Guess what? There's No apocalypse ! You will live to die into Eternity.
        </p>
        <p>
            This is the content of Third article from the future. Guess what? There's No apocalypse ! You will live to die into Eternity.
        </p>
        <p>
            This is the content of Third article from the future. Guess what? There's No apocalypse ! You will live to die into Eternity.
        </p>`
    }
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
                        ${date}
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

var pool = new Pool(config);
app.get('/test-db', function (req, res) {
    // make request
    pool.query('SELECT * FROM test', function (err, results) {
       if (err) {
            res.status(500).send(err.toString());
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

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
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
    
    pool.query("SELECT * FROM article WHERE title = '"+ req.params.articleName + "'", function (err, results) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          if (results.rows.length === 0) {
              res.status(404).send('Article Not Found');
              
          } else {
              var articleData = results.row[0];
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
