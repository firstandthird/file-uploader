var express = require('express');
var path = require('path');

var app = express.createServer();

app.use(express.bodyParser({ uploadDir: '/tmp/uploads', keepExtensions: true }));
app.use(express.static(path.join(__dirname, '../dist')));
app.use("/tmp", express.static("/tmp"));

app.set("view options", {
  layout: false 
});

app.set("view engine", "jade");
app.set("views", "" + __dirname + "/views");

app.get('/', function(req, res) {
  res.render('index');
});

app.post('/', function(req, res) {
  res.send(req.files.file.path);
});

app.listen(3000);
