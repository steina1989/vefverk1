
// Utilities
const showdown = require('showdown');
const frontmatter = require('front-matter');
const fs = require('fs');
const converter = new showdown.Converter();
const util = require('util');
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const ejsLint = require('ejs-lint');

// Server
const express = require('express');
const app = express();

// Template engine
const ejs = require('ejs')
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use('/articles/img',express.static('./articles/img/'))

app.get('/articles/:slug', async (req, res) => {
    var filelist = await readdir('./articles');
    filelist = filelist.filter(item => item.endsWith('.md'))

    let found = false;
    for(var i = 0; i < filelist.length; i++){
        const data = await read('./articles/' + filelist[i]);
        const fm = frontmatter(data);
        let fileslug = fm.attributes.slug;
        if (req.params.slug === fileslug){
            let html = converter.makeHtml(fm.body)
            res.render('article', {html, title: fm.attributes.title});
            found = true;
        }
    }
    if (!found){
        res.status(404).render('error',{title : "Fannst ekki.",error : "Efnið fannst ekki."});
    }

});

app.get('/', async (req, res) => {
    var filelist = await readdir('./articles');
    filelist = filelist.filter(item => item.endsWith('.md'))

    var attrlist = [];
    for(var i = 0; i < filelist.length; i++){
        const data = await read('./articles/' + filelist[i]);
        const fm = frontmatter(data);

        let date = new Date(fm.attributes.date);
        fm.attributes.date = date.toDateString();   
       
        attrlist[i] = fm.attributes;
    }
    res.render('frontpage.ejs', {articles: attrlist, title: 'Greinasafn'});
});

async function sort(attrlist){
    attrlist.sort(async function(a,b){
        var date1,date2;
        date1 = await a.attributes.date;
        date2 = await b.attributes.date;
        if (date1 >= date2) return -1;
        else return 1;
    })
}


async function read(file) {
    const data = await readFile(file);
    return data.toString();
}

  // Handle 404
  app.use(function(req, res) {
    res.render('error',{title : "Fannst ekki.",error : "Efnið fannst ekki."});
 });
 
//  // Handle 500
//  app.use(function(error, req, res, next) {
//     res.render('error',{title : "Obbossí",error : "Eitthvað fór úrskeiðis."})
//  });

// Exports
module.exports = app
