const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
  if (!isloggedIn(req)) {
    res.send(
      "Please <a href='/login/'>login</a> or <a href='/register/'>register.</a>"
    );
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]],
      urls: urlsForUser(req.cookies["user_id"]),
    };
    res.render("urls_index", templateVars);
  }
});

// create new url page
app.get("/urls/new", (req, res) => {
  if (!isloggedIn(req)) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);
  }
});

// specific url info page
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: `${urlDatabase[req.params.id].longURL}`,
  };
  res.render("urls_show", templateVars);
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
  if (!isloggedIn(req)) {
    res.send("Cannot shorten URL: Not logged in");
  } else {
    let assignedID = generateRandomString();
    urlDatabase[assignedID] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"],
    };
    res.redirect(`/urls/${assignedID}`);
  }
});

// update longURL of this entry
app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.updatedURL;
  res.redirect(`/urls/`);
});

// delete entry
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls/`);
});

// login page
app.get("/login", (req, res) => {
  if (isloggedIn(req)) {
    res.redirect(`/urls/`);
  } else {
    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("login", templateVars);
  }
});

// new account page
app.get("/register", (req, res) => {
  if (isloggedIn(req)) {
    res.redirect(`/urls/`);
  } else {
    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("register", templateVars);
  }
});

// login form submission
app.post("/login", (req, res) => {
  const foundUser = getUserByEmail(req.body.email);
  if (foundUser && req.body.password === foundUser.password) {
    res.cookie("user_id", foundUser.id);
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
  if (getUserByEmail(req.body.email)) {
    return res.sendStatus(404);
  }
  const assignedID = generateRandomString();
  users[assignedID] = {
    id: assignedID,
    email: req.body.email,
    password: req.body.password,
  };
  // login following succesful user creation
  res.cookie("user_id", assignedID);
  res.redirect(`/urls/`);
});

// navbar logout button
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
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

/////// Utility functions ///////

// for use in creating shortURL / user ID
const generateRandomString = function () {
  const alphanum =
    "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789";
  let arr = [];
  for (let i = 0; i < 6; i++) {
    arr.push(alphanum[Math.floor(Math.random() * alphanum.length)]);
  }
  return arr.join("");
};

// check if user already exists
const getUserByEmail = function (inputtedEmail) {
  for (const user in users) {
    if (users[user].email === inputtedEmail) {
      return users[user];
    }
  }
  return null;
};

// check if user is logged in
const isloggedIn = function (req) {
  return req.cookies["user_id"] && users[req.cookies["user_id"]] ? true : false;
};

// retrieve input user's owned links
const urlsForUser = function (id) {
  const ownedUrlDatabase = {};
  for (const entry in urlDatabase) {
    if (urlDatabase[entry].userID === id) {
      ownedUrlDatabase[entry] = urlDatabase[entry];
    }
  }
  return ownedUrlDatabase;
};
