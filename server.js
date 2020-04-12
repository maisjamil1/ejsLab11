'use strict';
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;
const app = express();
app.set('view engine', 'ejs');

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



app.get('/searches/show',(req,res)=>{
  console.log("searching inputs:",req.query);
    res.render('pages/searches/show');
});




app.get('/error',(req,res)=>{
  throw new Error('pages/error');
});



app.listen(PORT, () => console.log('server is running '+PORT));
