
// Utilities
const showdown = require('showdown');
const frontmatter = require('front-matter');
const fs = require('fs');

const converter = new showdown.Converter();
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

// Server
const express = require('express');

const app = express();

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

app.use('/static', express.static('public'));
app.use('/articles/img', express.static('./articles/img/'));


// Helpers
async function read(file) {
  const data = await readFile(file);
  return frontmatter(data.toString());
}


// Routes
app.get('/articles/:slug', async (req, res) => {
  let filelist = await readdir('./articles');
  filelist = filelist.filter(item => item.endsWith('.md'));

  const promises = filelist.map(async value => read(`./articles/${value}`));

  let found = false;
  Promise.all(promises).then((result) => {
    for (let i = 0; i < result.length; i += 1) {
      const fm = result[i];
      const fileslug = fm.attributes.slug;
      if (req.params.slug === fileslug) {
        const html = converter.makeHtml(fm.body);
        res.render('article', { html, title: fm.attributes.title });
        found = true;
      }
    }
    if (!found) {
      res.status(404).render('error', { title: 'Fannst ekki.', error: 'Efnið fannst ekki.' });
    }
  });
});

app.get('/', async (req, res) => {
  let filelist = await readdir('./articles');
  filelist = filelist.filter(item => item.endsWith('.md'));

  const promises = filelist.map(async value => read(`./articles/${value}`));

  Promise.all(promises).then((fmlist) => {
    const attrList = [];
    fmlist.sort((a, b) => {
      const date1 = Date.parse(a.attributes.date);
      const date2 = Date.parse(b.attributes.date);
      if (date1 >= date2) return -1;
      return 1;
    });

    for (let i = 0; i < fmlist.length; i += 1) {
      const date = new Date(fmlist[i].attributes.date);
      attrList.push({ attributes: fmlist[i].attributes, prettydate: date.toDateString() });
    }
    res.render('frontpage.ejs', { articles: attrList, title: 'Greinasafn' });
  });
});


// Handle 404
app.use((req, res) => {
  res.render('error', { title: 'Fannst ekki.', error: 'Efnið fannst ekki.' });
});

// Handle 500
app.use((error, req, res) => {
  res.render('error', { title: 'Obbossí', error: 'Eitthvað fór úrskeiðis.' });
  console.error(error);
});

// Exports
module.exports = app;
