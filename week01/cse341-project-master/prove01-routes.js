const fs = require('fs');

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;
  if (url === '/') {
    res.write('<html>');
    res.write('<head><title>Enter Message</title><head>');
    res.write('<body><h1>Welcome!</h1><form action="/create-user" method="POST"><input type="text" name="username"><button type="submit">Send</form></body>');
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
      fs.writeFile('message.txt', message, err => {
        res.statusCode = 302;
        res.setHeader('Location', '/');
        return res.end();
      });
    });
  }
  // res.setHeader('Content-Type', 'text/html');
  // res.write('<html>');
  // res.write('<head><title>My First Page</title><head>');
  // res.write('<body><h1>Hello from my Node.js Server</body>');
  // res.write('</html>');
  // res.end();
};

module.exports = requestHandler;