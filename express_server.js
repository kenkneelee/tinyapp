const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    id: req.params.id,
    longURL: `${urlDatabase[req.params.id]}` /* What goes here? */,
  };
  res.render("urls_show", templateVars);
});

// add new url entry
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  let assignedID = generateRandomString();
  urlDatabase[assignedID] = req.body.longURL;
  res.redirect(`/urls/${assignedID}`); // Respond with 'Ok' (we will replace this)
});

// delete entry
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls/`); // Respond with 'Ok' (we will replace this)
});

// redirect to view/edit url page
app.post("/urls/:id/edit", (req, res) => {
  res.redirect(`/urls/${req.params.id}`); // Respond with 'Ok' (we will replace this)
});

// update longURL of this entry
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.updatedURL;
  res.redirect(`/urls/`); // Respond with 'Ok' (we will replace this)
});

// redirect to longurl
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(`${longURL}`);
});

// navbar login form
app.post("/login", (req, res) => {
  inputtedUsername = req.body.username;
  res.cookie("username", inputtedUsername);
  res.redirect(`/urls/`);
});

// navbar logout button
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect(`/urls/`);
});

// allows users to connect
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// for use in creating shortURL / entry ID
function generateRandomString() {
  const alphanum =
    "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789";
  let arr = [];
  for (let i = 0; i < 6; i++) {
    arr.push(alphanum[Math.floor(Math.random() * alphanum.length)]);
  }
  return arr.join("");
}
