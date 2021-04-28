const express = require('express');

const app = express();

app.use((req, res, next) => {
  console.log('First middleware');
  next();
});

app.use((req, res, next) => {
  console.log('Second middleware');
  res.send('<h1>Hello from express!');
});

// app.use('/', (req, res, next) => {
//   console.log('Just the / request');
//   next();
// });

// app.use('/users', (req, res, next) => {
//   console.log('The /users request');
//   next();
// });

app.listen(3000);