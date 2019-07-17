const express = require('express'); 
const bodyParser = require('body-parser');
const morgan = require('morgan');
const sqlite3 = require('sqlite3');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const PORT = process.env.PORT || 4000;

// Import and mount the apiRouter
const apiRouter = require('./api/api');
app.use('/api', apiRouter);

app.listen(PORT, () => { console.log(`Server is listening on port: ${PORT}`)});
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

module.exports = app;
