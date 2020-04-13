'use strict';
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static('public'));



app.get('/hello', (request, response) => {
    response.render('pages/index');
});

app.get('/', (req, res) => {
  const url = 'https://www.googleapis.com/books/v1/volumes?q=quilting';
  superagent.get(url).then((apiResponse) => {
    console.log(apiResponse.body.items[0]);
  });
  res.render('pages/index');
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

































//________________________________________

app.get('/error',(req,res)=>{
  throw new Error('pages/error');
});



app.listen(PORT, () => console.log('server is running '+PORT));
