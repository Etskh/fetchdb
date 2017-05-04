'use strict';

const fetchdb = require('./lib/fetch');
const logger = require('./lib/logger');
const crypt = require('crypt');

const dbConfig = {
  filename: './db.sqlite3',
  type: 'sqlite3',
};
const groupModelSchema = {
  name: 'string',
};
const userModelSchema = {
  username: 'string',
  password: 'string',
  authenticate: (password) => {
    return this.password === crypt(password);
  },
  //group: fetchdb.oneToMany('group'),
};


const adminData = {
  username: 'admin',
  password: 'asdf1',
};

const groupModel = fetchdb('group', {db: dbConfig, schema: groupModelSchema });
const userModel = fetchdb('user', {db: dbConfig, schema: userModelSchema });

console.log(fetchdb('user') === userModel );


function getOrCreateAdminGroup() {
  // Get the admin, or create one if it doesn't exist
  return groupModel.search({ name: 'admin' }).then( groups => {
    if( groups.length === 0 ) {
      return groupModel.create({
        name: 'admin'
      });
    }
    return groups[0];
  });
}



function getOrCreateAdmin( adminGroup ) {
  // Get the admin, or create one if it doesn't exist
  return userModel.search({ username: adminData.username }).then( users => {
    if( users.length === 0 ) {
      return userModel.create(adminData);
    }
    return users[0];
  });
}

getOrCreateAdminGroup()
.then( getOrCreateAdmin )
.then( admin => {
  logger.info({admin: admin});
  admin.password = Math.random().toString();
  return admin.save();
}).then( admin => {
  console.log('randomized the pw');
}).catch( err => {
  logger.error(err);
});
