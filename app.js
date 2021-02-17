const api = require('./routes/api');
const cookieParser = require('cookie-parser');
const entries = require('./routes/entries');
const Entry = require('./models/entry');
const express = require('express');
const logger = require('morgan');
const messages = require('./middleware/messages');
const path = require('path');
const login = require('./routes/login');
const page = require('./middleware/page');
const register = require('./routes/register');
const session = require('express-session');
const users = require('./routes/users');
const user = require('./middleware/user');
const validate = require('./middleware/validate');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('json spaces', 2);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', api.auth);
app.get('/api/user/:id', api.user);
// app.get('/api/entries/:page?', api.entries);
// app.post('/api/entry', api.add);
app.post('/api/entry', entries.submit);
app.get('/api/entries/:page?', page(Entry.count), api.entries);

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

app.use(user);

app.use(messages);

app.use('/users', users);


app.get('/', entries.list);
app.get('/post', entries.form);
app.post('/post',
    validate.required('entry[title]'), validate.lengthAbove('entry[title]', 4),
    entries.submit
);
app.get('/register', register.form);
app.post('/register', register.submit);
app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/logout', login.logout);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
