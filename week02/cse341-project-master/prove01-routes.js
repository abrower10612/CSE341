const fs = require('fs');

const userList = [];

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === '/') {
    res.write('<html>');
    res.write('<head><title>Enter Message</title><head>');
    res.write(
      '<body>' 
      + '<h1>Welcome!</h1>'
      + '<form action="/create-user" method="POST">'
        + '<input type="text" name="username">'
        + '<button type="submit">Send</button>'
      + '</form>'
      + '<form action="/user-list" method="POST">'
        + '<button type="submit">See User List</button>'
      + '</form>'
      + '</body>');
    res.write('</html>');
    return res.end();
  }

  if (url === '/create-user' && method === 'POST') {
    const body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });

    return req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split('=')[1];
      console.log(message);
      userList.push(message);
      fs.appendFile('message.txt', message + '\n', err => {
        res.statusCode = 302;
        res.setHeader('Location', '/');
        return res.end();
      });
    });
  }

  if (url === '/user-list' && method === 'POST') {
      fs.readFile('./message.txt', 'utf8', (err, data) => {
        res.write('<html>');
        res.write('<head><title>Enter Message</title><head>');
        if (data.length == 0) {
          res.write(
            '<body>' 
              + '<h1>'
              + 'No users found'
              + '</h1>'
              + '<form action="/" method="POST">'
                + '<button type="submit">Back</button>'
              + '</form>'
            + '</body>');
        }
        else {
          res.write(
            '<body>' 
              + '<h1>Users:<br>')
              for (user of userList) {
                res.write(user);
                res.write('<br>');
              }
          res.write('</h1>'
              + '<form action="/" method="POST">'
                + '<button type="submit">Back</button>'
              + '</form>'
            + '</body>');
        }
        res.write('</html>');
        return res.end();
      });
  }
};

module.exports = requestHandler;