const http = require('http');

const routes = require('./example-routes');

const server = http.createServer(routes);

server.listen(3000);