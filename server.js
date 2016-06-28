var express = require('express');
var app = express();

app.use(express.static(__dirname + '/src'));

app.use('/',function(req, res) {
  // Use res.sendfile, as it streams instead of reading the file into memory.
  res.sendfile(__dirname + '/index.html');
});

app.listen(9000);