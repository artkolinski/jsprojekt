/*jshint node: true */
module.exports = function (app, passport, Account) { 
    app.get('/admin/horses', function (req, res) {
        res.render('admin/horses');
    });

    // Passport ------------------------------------
     app.get('/', function (req, res) {
          res.render('index', { 
              user : req.user,
              login: req.isAuthenticated() });
     });

    app.get('/register', function(req, res) {
          res.render('register', { });
     });

    app.post('/register', function(req, res) {
        Account.register(new Account({username : req.body.username, nazwisko: req.body.nazwisko}), req.body.password, function(err, account) {
            if (err) {
                return res.render('register', { account : account });
            }
            passport.authenticate('local')(req, res, function () {
              res.redirect('/');
            });
        });
     });

    app.get('/login', function(req, res) {
          res.render('login', { user : req.user });
    });

    app.post('/login', passport.authenticate('local'), function(req, res) {
          res.redirect('/');
    });

    app.get('/logout', function(req, res) {
          req.logout();
          res.redirect('/');
    });
};