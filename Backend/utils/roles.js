/**
 * Admin check for controllers. Matches middleware/auth.js `authorize` and
 * middleware/ownership.js: holding the admin role is enough, whichever role the
 * person is currently acting as. (`req.user.role` is only the *active* role, so a
 * route that let an admin in could still refuse them inside the controller.)
 */
const isAdminUser = (user) => Array.isArray(user?.roles) && user.roles.includes('admin');

module.exports = { isAdminUser };
