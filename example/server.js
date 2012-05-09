var express = require('express');
var path = require('path');

var app = express.createServer();

var uploadPath = path.join(__dirname, 'uploads');
app.use(express.bodyParser({ uploadDir: uploadPath, keepExtensions: true }));
app.use(express.static(path.join(__dirname, '../support')));
app.use(express.static(path.join(__dirname, '../lib')));
app.use("/uploads", express.static(uploadPath));

app.set("view options", {
  layout: false 
});

app.set("view engine", "jade");
app.set("views", "" + __dirname + "/views");

app.get('/', function(req, res) {
  res.render('index');
});

app.post('/', function(req, res) {
  res.send(req.files.image.path.replace(__dirname, ''));
});

app.listen(8001);