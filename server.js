let path = require('path');
let express = require('express');
let ExpressPeerServer = require('peer').ExpressPeerServer;
let ehbs = require('express-handlebars');

let port = process.argv[2] || 9000;
let app = express();
let hbs = ehbs.create({
  defaultLayout: 'main',
  helpers: {},
  partiailsDir: 'views/partials'
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
  res.render('central', {
    // template vars
  });
});

let server = app.listen(port);

let options = {
    debug: true
}

app.use('/ps', ExpressPeerServer(server, options));