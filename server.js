var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');


var config = {
  user: 'dimpu47', //env var: PGUSER 
  database: 'dimpu47', //env var: PGDATABASE 
  password: process.env.DB_PASSWORD, //env var: PGPASSWORD 
  host: 'db.imad.hasura-app.io',
  port: 5432, //env var: PGPORT 
  max: 10, // max number of clients in the pool 
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed 
};



var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

app.use(session({
   secret:'someRandomValue',
   cookie:{maxAge: 1000*60*24*30}
}));



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
                        
                        </div class="container form-group">
                          <hr/>
                          <h4>Comments</h4>
                          <div id="comment_form">
                          </div>
                          <div id="comments">
                            <center>Loading comments...</center>
                        </div>
                        
                    </div>
                    
                    
                    
                </div>

            </div>
             <script type="text/javascript" src="/ui/article.js"></script>
        </body>
    </html>
    `;
    return htmlTemplate;
}




function hash(input, salt) {
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
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
    var dbString = hash(password, salt);
    
    pool.query('INSERT INTO "user" (username, password) values($1,$2)', [username, dbString], function (err, results) {
        if (err) {
            res.status(500).send(err.toString());
        } else {
            res.send('User Successfully Created' + username);
        }
    });
});

app.post('/login',function(req,res){
    
    var username = req.body.username;
    var password = req.body.password;
    
     pool.query('SELECT * FROM "user" WHERE username =$1',[username],function(err,result){
       if(err){
           res.status(500).send(err.toString());
       } else{
           if(result.rows.length === 0){
               res.status(403).send('Username/Password is Invalid');
           } else {
               var dbString = result.rows[0].password;
               var salt = dbString.split('$')[2];
               var hashedPassword = hash(password,salt);
               if (hashedPassword === dbString) {
                   req.session.auth={userId: result.rows[0].id};
                   res.send('credentials correct.');
                    
               } else {
                 res.status(403).send('Username/Password is Invalid');  
               }
           }
       }
});

});

app.get('/check-login', function (req, res) {
    if (req.session && req.session.auth && req.session.auth.userId) {
       pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
               res.status(500).send(err.toString());
           } else {
               res.send(result.rows[0].username);    
           }
       });
    }else {
       res.status(400).send('You are not logged in');
   }
});

app.get('/logout',function (req,res){
   delete req.session.auth;
   res.send('<html><body></br><div align="center"><h3>Logged out!</h3><br/><br/><a href="/">Back to home</a> </div></body></html>');
    
});


var pool = new Pool(config);
app.get('/get-articles', function (req, res) {

   pool.query('SELECT * FROM article ORDER BY date DESC', function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});



app.get('/get-comments/:articleName', function (req, res) {

  pool.query('SELECT comment.*, "user".username FROM article, comment, "user" WHERE article.title = $1 AND article.id = comment.article_id AND comment.user_id="user".id ORDER BY comment.timestamp DESC', [req.params.articleName], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });

});



app.post('/submit-comment/:articleName', function (req, res) {

    if (req.session && req.session.auth && req.session.auth.userId) {
        pool.query('SELECT * from article where title = $1', [req.params.articleName], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if (result.rows.length === 0) {
                    res.status(400).send('Article not found');
                } else {
                    var articleId = result.rows[0].id;
                    pool.query("INSERT INTO comment (article_id, user_id, comment) VALUES ($1, $2, $3)", [articleId, req.session.auth.userId,req.body.comment], function (err, result) {
                            if (err) {
                               res.status(500).send(err.toString());
                            } else {
                                res.status(200).send('Comment inserted!');
                            }
                        });
                }
            }
       });     
    } else {
        res.status(403).send('Only logged in users can comment');
    }
});

app.get('/info', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'info.html'));
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

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});



app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

app.get('/ui/article.js', function (req, res) { 
  res.sendFile(path.join(__dirname, 'ui', 'article.js')); 
});

app.get('/ui/info.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'info.js'));
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
