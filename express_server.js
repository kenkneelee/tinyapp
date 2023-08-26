const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  generateRandomString,
  getUserByEmail,
  isloggedIn,
  urlsForUser,
} = require(`./helpers`);

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

// learning to use routes
app.get("/", (req, res) => {
  res.send("Hello!");
});

// list of all urls
app.get("/urls", (req, res) => {
  if (!isloggedIn(req, users)) {
    res.send(
      "Welcome to TinyApp. Please <a href='/login/'>login</a> or <a href='/register/'>register.</a>"
    );
  } else {
    const templateVars = {
      user: users[req.session.user_id],
      urls: urlsForUser(req.session.user_id, urlDatabase),
    };
    res.render("urls_index", templateVars);
  }
});

// create new url page
app.get("/urls/new", (req, res) => {
  if (!isloggedIn(req, users)) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  }
});

// specific url info page
app.get("/urls/:id", (req, res) => {
  if (!isloggedIn(req, users)) {
    res.send(
      "Not logged in! Please <a href='/login/'>login</a> or <a href='/register/'>register.</a>"
    );
  } else if (!urlDatabase[req.params.id]) {
    res.status(404).send("URL does not exist.");
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send("This URL does not belong to you.");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
      id: req.params.id,
      longURL: `${urlDatabase[req.params.id].longURL}`,
    };
    res.render("urls_show", templateVars);
  }
});

// redirect to associated longurl
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("Link does not exist");
  } else {
    const foundLongURL = urlDatabase[req.params.id].longURL;
    res.redirect(`${foundLongURL}`);
  }
});

// add new url entry
app.post("/urls", (req, res) => {
  if (!isloggedIn(req, users)) {
    res.send("Cannot shorten URL: Not logged in");
  } else {
    let assignedID = generateRandomString();
    urlDatabase[assignedID] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${assignedID}`);
  }
});

// update longURL of this entry
app.post("/urls/:id/", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("Link not found.");
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send("You do not have permissions to edit this link.");
  } else {
    urlDatabase[req.params.id].longURL = req.body.updatedURL;
    res.redirect(`/urls/`);
  }
});

// delete entry
app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("Link not found.");
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send("You do not have permissions to delete this link.");
  } else {
    delete urlDatabase[req.params.id];
    res.redirect(`/urls/`);
  }
});

// login page
app.get("/login", (req, res) => {
  if (isloggedIn(req, users)) {
    res.redirect(`/urls/`);
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render("login", templateVars);
  }
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
  } else return res.sendStatus(403);
});

// register new user form submission
app.post("/register", (req, res) => {
  // errors: send error status and escape function early if:
  // - empty email or password fields
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    return res.sendStatus(400);
  }
  // - user exists already
  if (getUserByEmail(req.body.email, users)) {
    return res.sendStatus(404);
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
  req.session = null; // Clear the user's session
  res.redirect(`/login/`);
});

// allows users to connect
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Not in route checklist.
// // learning to use "res.json"
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// Not in route checklist.
// // learning to use "res.send"
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
