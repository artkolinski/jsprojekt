/*jshint node: true */
module.exports = function (app, role) { 
    role.use(function (req, action) {
  if (!req.isAuthenticated()) return action === 'access home page';
});

role.use(function(req, action){
    if(req.isAuthenticated() && action != 'access judge pages' && action != 'access admin pages')
      return true;
});

role.use('access judge pages', function (req) {
  console.log('access judge pages');
  if (req.user.role === 'sedzia') {
    return true;
  }
});

role.use(function (req) {
  if (req.user.role === 'admin') {
    return true;
  }
});
};