// import and setup server
const express = require("express");
const app = express();
const PORT = 8080;
// import cookie and password security packages
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
// import helper functions
const {
  generateRandomString,
  getUserByEmail,
  isloggedIn,
  urlsForUser,
} = require(`./helpers`);

// server middleware setup
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["very-secret", "totally-not-exposed-keys"],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const users = {};

// sample database left in for easier grading of POST permissions
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
};

// base directory redirects
app.get("/", (req, res) => {
  if (isloggedIn(req, users)) {
    return res.redirect(`/urls/`);
  }
  res.redirect(`/login/`);
});

// list of all urls
app.get("/urls", (req, res) => {
  if (!isloggedIn(req, users)) {
    return res.send(
      "Welcome to TinyApp. Please <a href='/login/'>login</a> or <a href='/register/'>register.</a>"
    );
  }
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase),
  };
  res.render("urls_index", templateVars);
});

// create new url page
app.get("/urls/new", (req, res) => {
  if (!isloggedIn(req, users)) {
    return res.redirect("/login/");
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

// specific url info page
app.get("/urls/:id", (req, res) => {
  if (!isloggedIn(req, users)) {
    return res
      .status(403)
      .send(
        "Not logged in! Please <a href='/login/'>login</a> or <a href='/register/'>register.</a>"
      );
  }
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("URL does not exist.");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(403).send("This URL does not belong to you.");
  }
  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
    longURL: `${urlDatabase[req.params.id].longURL}`,
  };
  res.render("urls_show", templateVars);
});

// redirect to associated longurl
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Link does not exist");
  }
  const foundLongURL = urlDatabase[req.params.id].longURL;
  res.redirect(`${foundLongURL}`);
});

// add new url entry
app.post("/urls", (req, res) => {
  if (!isloggedIn(req, users)) {
    return res.status(403).send("Cannot shorten URL: Not logged in");
  }
  let assignedID = generateRandomString();
  urlDatabase[assignedID] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${assignedID}`);
});

// update longURL of this entry
app.post("/urls/:id/", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Link not found.");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res
      .status(403)
      .send("You do not have permissions to edit this link.");
  }
  urlDatabase[req.params.id].longURL = req.body.updatedURL;
  res.redirect(`/urls/`);
});

// delete entry
app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Link not found.");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res
      .status(403)
      .send("You do not have permissions to delete this link.");
  }
  delete urlDatabase[req.params.id];
  res.redirect(`/urls/`);
});

// login page
app.get("/login", (req, res) => {
  if (isloggedIn(req, users)) {
    return res.redirect(`/urls/`);
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
});

// new account page
app.get("/register", (req, res) => {
  if (isloggedIn(req, users)) {
    res.redirect(`/urls/`);
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render("register", templateVars);
  }
});

// login form submission
app.post("/login", (req, res) => {
  const foundUser = getUserByEmail(req.body.email, users);
  if (foundUser && bcrypt.compareSync(req.body.password, foundUser.password)) {
    req.session.user_id = foundUser.id;
    res.redirect(`/urls/`);
  } else return res.status(403).send("Invalid credentials.");
});

// register new user form submission
app.post("/register", (req, res) => {
  // errors: send error status and escape function early if:
  // - empty email or password fields
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    return res.status(400).send("Invalid email/password.");
  }
  // - user exists already
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("A user with that email already exists!");
  }
  const assignedID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[assignedID] = {
    id: assignedID,
    email: req.body.email,
    password: hashedPassword,
  };
  // login following succesful user creation
  req.session.user_id = assignedID;
  res.redirect(`/urls/`);
});

// navbar logout button
app.post("/logout", (req, res) => {
  // Clear the user's session
  req.session = null; 
  res.redirect(`/login/`);
});

// allows users to connect
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

