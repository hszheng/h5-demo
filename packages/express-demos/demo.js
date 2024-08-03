const http = require('http');
const https = require('https');
const url = require('url');

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

const server = http.createServer((req, res) => {
  res.setHeader('Content-Security-Policy', "default-src 'self', 'https://jsonplaceholder.typicode.com'");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.url.startsWith('/posts/')) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ id: req.url.slice(7), title: `Post ${req.url.slice(7)}` }));
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }  
  const requestUrl = url.parse(req.url);
  const apiRequestOptions = {
    hostname: 'jsonplaceholder.typicode.com',
    path: requestUrl.path,
    method: req.method,
    headers: req.headers
  };

  const apiRequest = https.request(apiRequestOptions, (apiResponse) => {
    res.writeHead(apiResponse.statusCode, apiResponse.headers);
    apiResponse.pipe(res);
  });

  req.pipe(apiRequest);

  apiRequest.on('error', (error) => {
    console.error(`API request failed: ${error}`);
    res.statusCode = 500;
    res.end('API request failed');
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});