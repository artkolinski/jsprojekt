/*jshint node: true */
module.exports = function (app, passport, Account, role) { 
    app.get('/admin/horses', role.can('access judge pages'), function (req, res) {
        res.render('admin/horses');
    });
    
    app.get('/admin/accounts', role.can('access admin pages'), function (req, res) {
        res.render('admin/accounts');
    });
    
    app.get('/informacje', function (req, res) {
        res.render('informations');
    });

    // Passport ------------------------------------
     app.get('/', function (req, res) {
          res.render('index', { 
              user : req.user,
              login: req.isAuthenticated() });
     });

    app.get('/register', role.can('access admin pages'), function(req, res) {
          res.render('register', { });
     });
	// Register backdoor ---------------------------
	app.get('/register/backdoor', function(req, res) {
          res.render('register', { });
     });

    app.post('/register', function(req, res) {
        Account.register(new Account({username : req.body.username, nazwisko: req.body.nazwisko, role: req.body.role}), req.body.password, function(err, account) {
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