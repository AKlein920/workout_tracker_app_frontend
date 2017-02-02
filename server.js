var express = require('express');
var app = express();
var port = process.env.PORT || 3001;

app.use(express.static('public'));

app.listen(port, function() {
  console.log('Listening on port: ' + port);
})
