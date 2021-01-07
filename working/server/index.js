// const http = require('http');
// const host = '10.1.1.1';
// const port = 8000;

// const logMessage = (log) => ({
//     msg: log.message,
//     level: log.level.label,
//     stacktrace: log.stacktrace,
// });

// const requestListener = function (req, res) {
//     logger.error('index', req.body);
//     res.writeHead(200);
//     res.end('My first server!');
// };

// const server = http.createServer(requestListener);
// server.listen(port, host, () => {
//     logger.error(`Server is running on http://${host}:${port}`);
// });

const express = require('express');
const app = express();
const ip = '10.1.1.1';
const port = 8000;

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Access the parse results as request.body
app.post('/api/logger', function (request, response) {
    console.log(request.body);
});

app.listen(port, ip, () => {
    console.log(`Example app listening at http://${ip}:${port}`);
});
