
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
    return data.toString();
}


// Routes
app.get('/articles/:slug', async (req, res) => {
    let filelist = await readdir('./articles');
    filelist = filelist.filter(item => item.endsWith('.md'));

    let promises = filelist.map(async (value) => {
        return read(`./articles/${value}`);
    })

    let found = false;
    Promise.all(promises).then((filelist) => {

        filelist.sort((a, b) => {
            let date1 = a.attributes.date;
            let date2 = b.attributes.date;
            if (date1 >= date2) return -1;
            else return 1;
        });

        for (let i = 0; i < filelist.length; i += 1) {
            const fm = frontmatter(filelist[i]);
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
    })
});

app.get('/', async (req, res) => {
    let filelist = await readdir('./articles');
    filelist = filelist.filter(item => item.endsWith('.md'));

    const attrlist = [];
    for (let i = 0; i < filelist.length; i += 1) {
        const data = await read(`./articles/${filelist[i]}`);
        const fm = frontmatter(data);

        const date = new Date(fm.attributes.date);
        fm.attributes.date = date.toDateString();

        attrlist[i] = fm.attributes;
    }
    res.render('frontpage.ejs', { articles: attrlist, title: 'Greinasafn' });
});

// async function sort(attrlist) {
//     attrlist.sort((a, b) => {
//         let date1,
//             date2;
//         date1 = await a.attributes.date;
//         date2 = await b.attributes.date;
//         if (date1 >= date2) return -1;
//         return 1;
//     });
// }


// Handle 404
app.use((req, res) => {
    res.render('error', { title: 'Fannst ekki.', error: 'Efnið fannst ekki.' });
});

//  // Handle 500
//  app.use(function(error, req, res, next) {
//     res.render('error',{title : "Obbossí",error : "Eitthvað fór úrskeiðis."})
//  });

// Exports
module.exports = app;
