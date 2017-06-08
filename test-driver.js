'use strict';

const fetchdb = require('./lib/fetch');
const logger = require('./lib/logger');
const crypt = require('crypt');

const dbConfig = {
  filename: './db.sqlite3',
  type: 'sqlite3',
};



const permissionModelSchema = {
  db: dbConfig,
  schema: {
    code: 'string',
    description: 'string',
  },
};
const groupModelSchema = {
  db: dbConfig,
  schema: {
    name: 'string',
    description: 'string',
  },
};
const userModelSchema = {
  db: dbConfig,
  schema: {
    username: 'string',
    password: 'string',
    group: fetchdb.foreignKey('group'),
  },
  methods: {
    authenticate: (self, password) => {
      return self.password === password;
    },
  },
};



const permissionModel = fetchdb('permission', permissionModelSchema);
const groupModel = fetchdb('group', groupModelSchema);
const userModel = fetchdb('user', userModelSchema);


//fetch('group').loadFixtures('name', )


function getOrCreateAdminGroup() {
  // Get the admin, or create one if it doesn't exist
  return groupModel.search({ name: 'admin' }).then( groups => {
    if( groups.length === 0 ) {
      return groupModel.create({
        name: 'admin',
        description: 'Base manager of system',
      });
    }
    return groups[0];
  });
}

function getOrCreateAdmin( adminGroup ) {
  const adminData = {
    username: 'admin',
    password: 'asdf1',
    group: adminGroup,
  };
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
  admin.password = 'empire';
  return admin.save();
}).then( admin => {
  if ( admin.authenticate('empire')) {
    console.log('Password works!');
  }
  else {
    console.log('Password DOESNT WORK');
  }
}).catch( err => {
  logger.error(err);
});

//*/
