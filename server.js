var express = require('express');
var morgan = require('morgan');
var path = require('path');

var app = express();
app.use(morgan('combined'));

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
        </p>`
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
        </head>
        <body class='bg'>
            <div class="container">
                <div>
                    <a href="/">Home</a>
                </div>
                <hr/>
                <h3>
                    ${heading}
                </h3>
                <div>
                    ${date}
                </div>
                <div>
                    ${content}
                </div>
            </div>
        </body>
    </html>
    `;
    return htmlTemplate;
}

var counter=0;
app.get('/counter', function(req,res){
 counter += 1;
 res.send(counter,toString());
});   

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/:articleName', function(req,res) {
    var articleName = req.params.articleName;
    res.send(createTemplate(articles[articleName]));
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
