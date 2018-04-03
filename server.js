let path = require('path');
let express = require('express');
let ExpressPeerServer = require('peer').ExpressPeerServer;
let ehbs = require('express-handlebars');

let port = process.argv[2] || 9000;
let app = express();
let hbs = ehbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {},
  partiailsDir: 'views/partials'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
  res.render('central', {
    // template vars
  });
});
app.get('/station', function (req, res) {
  res.render('station', {
    // template vars
  });
});

let server = app.listen(port);
console.log(`app listening on port ${port}`);

let options = {
    debug: true
}

app.use('/ps', ExpressPeerServer(server, options));