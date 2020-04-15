'use strict';
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (err) => console.log(err));







app.use('/public', express.static('public'));



app.get('/hello', (request, response) => {
    response.render('pages/index');
});


app.get('/', (req, res) => {
  const SQL = 'SELECT * FROM books;';
  client
    .query(SQL)
    .then((bookresults) => {
      res.render('pages/index', { books: bookresults.rows });
    })
    .catch((err) => {
      errorHandler(err, req, res);
    });
});




app.get('/searches/new',(req,res)=>{
  console.log("searching inputs:",req.query);
    res.render('pages/searches/new');
});


//___________________________________________________________
app.post('/searches', (request, response) => {
       
  let bookAPI = `https://www.googleapis.com/books/v1/volumes?q=${request.body.searchingtext}+in${request.body.searchingtype}`

  superagent.get(bookAPI).then((apiRes) => {
     
      let googlebooks = apiRes.body.items;
           
      let bookInfo = googlebooks.map(ele => {
          return new Book(ele);
      })
      
      response.render('pages/searches/show', { book: bookInfo});


  }).catch((err) => errorHandler(err, request, response))

})



function Book(ele) {
  this.authors = ele.volumeInfo.authors;
  this.title = ele.volumeInfo.title;
  this.description = ele.volumeInfo.description;
  this.img_url = ele.volumeInfo.imageLinks.thumbnail;
}

app.get('/books/:book_id', (req, res) => {
  const SQL = 'SELECT * FROM books WHERE id=$1;'
  console.log(req.params);
  console.log(req.params.book_id);
  const values = [req.params.book_id];
  client
  .query(SQL, values)
  .then((bookresults) => {
      res.render('pages/books/detail', {book: bookresults.rows[0]});
  }).catch((err) => {
      errorHandler(err, req, res);
  });

})





app.post('/books', (req, res)=> {
  const { title,authors,isbn,image_url,description,bookshelf } = req.body;
  const SQL = 'INSERT INTO books (author,title,isbn,image_url,description,bookshelf) VALUES ($1,$2,$3,$4,$5,$6);';
  const value = [title,authors,isbn,image_url,description,bookshelf];
  client.query(SQL, value).then((results) => {
      // res.redirect('pages/books/show'), {book : value});
      res.redirect('pages/books/show', {book : value});
  }).catch((err) => errorHandler(err, req, res));
})



// title VARCHAR(255),
// authors VARCHAR(255),
// isbn VARCHAR(255),
// image_url VARCHAR(255),
// description TEXT,
// bookshelf VARCHAR(255)



//________________________________________



app.use('*', notFoundHandler);
function notFoundHandler(req, res) {
  res.status(404).send('PAGE NOT FOUND');
}
function errorHandler(err, req, res) {
  res.status(500).render('pages/error', { error: err });
}
// app.listen(PORT, () => console.log('server is running '+PORT));
// ********
client.connect().then(() => {
  app.listen(PORT, () => console.log('up on', PORT));
});