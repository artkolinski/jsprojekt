/*jshint node: true */
module.exports = function (app, passport, Account, role) { 
	
	// Admin ------------------------------------
	//app.get('/admin/horses', role.can('access judge pages'), function (req, res) {
    app.get('/admin/horses', function (req, res) {
        res.render('admin/horses');
    });
	
	app.get('/admin/spectators', function (req, res) {
        res.render('admin/spectators');
    });
	
    //app.get('/admin/accounts', role.can('access admin pages'), function (req, res) {
    app.get('/admin/accounts', function (req, res) {
        res.render('admin/accounts');
    });
	
	//app.get('/admin/createcompetition', role.can('access admin pages'), function (req, res) {
	app.get('/admin/createcompetition', function (req, res) {
        res.render('admin/createcompetition');
    });
    
    app.get('/informacje', function (req, res) {
        res.render('informations');
    });
	
	// Sedzia ------------------------------------
	app.get('/judge/judgevoting', role.can('access judge pages'), function (req, res) {
        res.render('judge/judgevoting', {
			user : req.user,
			login: req.isAuthenticated()
		});
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
	
	// Widzowie ------------------------------------
	app.get('/spectators', function (req, res) {
        res.render('spectators');
    });
	
	// Register backdoor ---------------------------
	app.get('/register/backdoor', function(req, res) {
          res.render('register', { });
     });

    app.post('/register', function(req, res) {
        Account.register(new Account({username : req.body.username, imie: req.body.imie, nazwisko: req.body.nazwisko, role: req.body.role}), req.body.password, function(err, account) {
            if (err) {
                return res.render('register', { account : account });
            }
			res.redirect('/admin/accounts');
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