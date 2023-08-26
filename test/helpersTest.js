const { assert } = require("chai");

const {
  generateRandomString,
  getUserByEmail,
  isloggedIn,
  urlsForUser,
} = require("../helpers.js");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const testRequest = {
  session: { user_id: "user2RandomID" },
};

const testRequest2 = {
  session: { user_id: "brokenFakeSession" },
};

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "user2RandomID" },
};

describe("generateRandomString", function() {
  it("should return a 6-digit string", function() {
    const generatedString = generateRandomString();
    assert.strictEqual(generatedString.length, 6);
  });
});

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it("should return null with an invalid email", function() {
    const user = getUserByEmail("nonexistentuser@example.com", testUsers);
    assert.strictEqual(user, null);
  });
});

describe("isLoggedIn", function() {
  it("should return true for valid login session", function() {
    const loginTest1 = isloggedIn(testRequest, testUsers);
    assert.isTrue(loginTest1);
  });
  it("should return false for invalid login session", function() {
    const loginTest2 = isloggedIn(testRequest2, testUsers);
    assert.isFalse(loginTest2);
  });
});

describe("urlsForUser", function() {
  it("should return correct list of owned links for valid user", function() {
    const testUrlList = urlsForUser("userRandomID", testUrlDatabase);
    const expectedList = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "userRandomID",
      },
    };
    assert.deepEqual(testUrlList, expectedList);
  });
  it("should return empty list of owned links for valid user", function() {
    const testUrlList2 = urlsForUser("invalidUserID", testUrlDatabase);
    assert.deepEqual(testUrlList2, {});
  });
});
