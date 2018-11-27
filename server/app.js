const createError = require('http-errors');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const keys = require('./config/keys');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

const app = express();

// Connect to mongodb
mongoose.Promise = Promise;
mongoose.connect(
  keys.mongoURI,
  { useNewUrlParser: true }
);

// register the schemas
const User = require('./models/User');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// save sessions to mongodb
app.use(
  session({
    secret: keys.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

// load passport google service
require('./services/google')(User);

// initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// add the route handlers
app.use('/api/v1', indexRouter);
app.use('/auth', authRouter);

// redirect requests to react client app
if (['production'].includes(process.env.NODE_ENV)) {
  app.use(express.static('client/build'));

  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('client', 'build', 'index.html'));
  });
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
