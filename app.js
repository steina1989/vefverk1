
const express = require('express');
const app = express();
const fs = require('fs');
const articles = require('./articles');

const hostname = '127.0.0.1';
const port = 3000;
const person =  {name:"John", lastName:"Doe", age:50, eyeColor:"blue"};

app.use('/static',express.static('public'))

// Use subapp articles.
app.use('/', articles);

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

