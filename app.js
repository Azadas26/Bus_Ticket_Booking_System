var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var db = require('./connection/connect')
var session = require('express-session')
const fileUpload = require('express-fileupload')
const consts = require('./connection/consts')

var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var SuserRouter = require('./routes/suser');
var CheckerRouter = require('./routes/checker');
var FirstPageRouter = require('./routes/first')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,  // Allows access to prototype properties
    allowProtoMethodsByDefault: true      // (Optional) Allows access to prototype methods
  }
}));
app.use(session({ secret: "ker", cookie: { maxAge: 86400000 } }))
app.use(fileUpload())


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


db.Database_Connection().then((resc) => {
  console.log(resc);
}).catch((err) => {
  console.log(err);
})

app.use((req, res, next) => {
  db.get().collection(consts.adminbase).find().toArray().then((admin) => {
    if (!admin[0]) {
      db.get().collection(consts.adminbase).insertOne({
        "name": "admin",
        "password": "admin123"
      }).then(()=>{})
    }
    next()
  })
})

app.use('/', usersRouter);
app.use('/admin', adminRouter);
app.use('/suser', SuserRouter);
app.use('/checker', CheckerRouter);
app.use('/ticketsure', FirstPageRouter);

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
