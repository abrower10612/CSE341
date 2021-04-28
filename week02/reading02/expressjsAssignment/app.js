const express = require('express');

const app = express();

// app.use((req, res, next) => {
//   console.log('First middleware');
//   next();
// });

// app.use((req, res, next) => {
//   console.log('Second middleware');
//   res.send('<h1>Hello from express!');
// });

app.use('/users', (req, res, next) => {
  console.log('The /users request');
  res.send('<p>The middleware that handles /users</p>');
});

app.use('/', (req, res, next) => {
  console.log('/ middleware');
  res.send('<p>The middleware that handles just /</p>');
});


app.listen(3000);