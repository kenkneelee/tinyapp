/////// Utility functions ///////

// for use in creating shortURL / user ID
const generateRandomString = function() {
  const alphanum =
    "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789";
  let arr = [];
  for (let i = 0; i < 6; i++) {
    arr.push(alphanum[Math.floor(Math.random() * alphanum.length)]);
  }
  return arr.join("");
};

// check if user already exists
const getUserByEmail = function(inputtedEmail, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === inputtedEmail) {
      return userDatabase[user];
    }
  }
  return null;
};

// check if user is logged in
const isloggedIn = function(req, userDatabase) {
  // this function looks weird but does not return true/false unless explicitly stated
  return req.session.user_id && userDatabase[req.session.user_id]
    ? true
    : false;
};

// retrieve input user's owned links
const urlsForUser = function(id, urlDatabase) {
  const ownedUrlDatabase = {};
  for (const entry in urlDatabase) {
    if (urlDatabase[entry].userID === id) {
      ownedUrlDatabase[entry] = urlDatabase[entry];
    }
  }
  return ownedUrlDatabase;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  isloggedIn,
  urlsForUser,
};
