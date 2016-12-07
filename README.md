# fetchdb
Just a database for node that makes fetch happen

[![Build Status](https://travis-ci.org/Etskh/fetchdb.svg?branch=master)](https://travis-ci.org/Etskh/fetchdb)  [![Coverage Status](https://coveralls.io/repos/github/Etskh/fetchdb/badge.svg?branch=master)](https://coveralls.io/github/Etskh/fetchdb?branch=master)

## Usage

```javascript
const userModel = require('fetchdb')('user');


const createUser = function( username, password ) {

  // userModel.info( (info) => { info.count === 0 };

  return userModel.create({
    'name': username,
    'pass': crypt(password),
  }).then( (userController) => {
  
    // userModel.info( (info) => { info.count === 1 };
    return userController;
  });
};
```

## How it Works

When you call `require('fetchdb')`, you just create a map of models. That's it. Each model by default is created with a connection to an in-memory database.

At any point, you may call `fetch('modelName').init(...)` to reset the connection to any other database (we recommend this happens either when you first need it, or at app startup).

## Non-Trivial Example

First we'll instantiate our model.
```javascript
// module: user.js
const fetch = require('fetchdb');
const userModel = fetch('user');
```
This is the magic bit: `init` will take an object for configuring that connection to the module - this way you can have separate connections for each model, but maintain cross-dependencies.
```javascript
userModel.init({
  db: {
    type: 'sqlite',
    filepath: './users.sqlite3',
  },
  schema: {
    username: 'string',
    password: 'string',
    group: fetch('group').oneToMany,
    authenticate: (password) => {
      return this.password === crypt(password);
    },
  },
});
```
Create an export of a method for this module. This method will first fetch the group with the name "admin", and we can use this object for checking permissions. 
```javascript
/**
 * Creates a new admin user
 * @param {string} username The name for the user
 * @param {string} password The password for the user
 * @returns {promise} containing the controller for the created user
 */
module.exports.createAdmin = function( username, password ) {
  return fetch('group').filter({name: 'admin'}).one( (group) => {
    return userModel.create({
      username: username,
      password: crypt(password),
      group: group,
    });
  });
};
```
