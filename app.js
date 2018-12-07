require('dotenv').config();
const createError  = require('http-errors');
const cors         = require('cors');
const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const logger       = require('morgan');
const passport     = require('passport');
const mongoose     = require('mongoose');


require('./config/passport');

// initiate the app
const app = express();

// check database connection
mongoose
  .connect(process.env.MONGODB_URI, {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

// configure the app
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());

/****** ROUTES *******/
const authRoutes  = require('./routes/authRoutes')(passport);
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', passport.authenticate('jwt', { session : false , failureRedirect:'/api/auth/failedAuth'}), userRoutes );

const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', passport.authenticate('jwt', { session : false , failureRedirect:'/api/auth/failedAuth'}), postRoutes );

module.exports = app;
