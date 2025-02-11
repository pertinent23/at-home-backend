const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const createErrors = require("http-errors");
const http = require("http");
const debug = require('debug')('todo:server');

const app = express();

const global = express.Router();
const users = require("./routes/users");
const folders = require("./routes/folders");

const env = require("./env");
const connection = mongoose.connect(env.dbLink)
.then(() => {
    console.log("Database connection openned")
})
.catch(() => {
    console.log("Failed to open  database connection")
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(cookieParser());

app.use(bodyParser.json({
    limit: "80mb"
}));

app.use(bodyParser.urlencoded({
    extended: true,
    limit: "80mb" 
}));

app.use(logger("dev"))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

    next();
});

global.use('/users', users);
global.use('/folders', folders);


app.use("/api", global)

app.get("/", (req, res, next) => {
    res.json({name: "franck"})
})

app.use(function(req, res, next) {
    next(createErrors(404));
});
  
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    res.status(err.status || 500);
    res.render('error');
});

const port = (function normalizePort(val) {
    let port = parseInt(val, 10);
  
    if (isNaN(port)) return val;
  
    if (port >= 0) return port; 
  
    return false;
})(process.env.PORT || 3000)

app.set('port', port);

const server = http.createServer(app);

server.listen(port);

server.on("error", (err) => {
    if (err.syscall !== 'listen') {
        throw err;
    }
  
    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
  
    switch (err.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
        default:
            throw err;
    }
});

server.on("listening", () => {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
});