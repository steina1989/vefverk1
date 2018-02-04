
const express = require('express');

const app = express();
const articles = require('./articles');

const hostname = '127.0.0.1';
const port = 3000;

// Use subapp articles.
app.use('/', articles);

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

