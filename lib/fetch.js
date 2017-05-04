'use strict';

const _ = require('lodash');






const _connections = {
  // empty
};




// Create a database connection
// TODO: make this a module
const connection = {
  create: function ( modelName, dbConfig, schema ) {

    switch( dbConfig.type ) {
    case 'memdb':
      return require('./connectors/memory').create(modelName, dbConfig, schema);
    case 'sqlite3':
      return require('./connectors/new-sqlite3').create(modelName, dbConfig, schema);
    }

    return new Promise( ( resolve, reject ) => {
      return reject('No database connection by the name ' + dbConfig.type );
    });
  },
};



const createSchema = function( schema ) {
  // now we'll make the schema into object so that it can be used
  // by the connectors
  for( let field in schema ) {
    if( typeof schema[field] === 'string' ) {
      schema[field] = {
        type: schema[field],
        notNull: true,
      };
    }
  }

  return schema;
};



// creates controllers
const controller = require('./controller');


// TODO: make this a module
const createModel = function( modelName, initConfig ) {

  let db = connection.create(modelName, initConfig.db, createSchema(initConfig.schema) );
  let controllerMethods = _.get(initConfig, 'methods', {});

  return {
    connection: db,
    //
    name: modelName,
    data: initConfig,
    methods: controllerMethods,
    //
    create: function ( data ) {
      return db.then( connection => {
        return connection.insert(data).then( data => {
          return controller.create(connection, data, controllerMethods);
        });
      });
    },
    //
    search: function ( predicate ) {
      return db.then( connection => {
        return connection.search(predicate).then( elements => {
          const controllers = [];
          for( var e in elements ) {
            controllers.push(
              controller.create(connection, elements[e], controllerMethods)
            );
          }
          return Promise.all(controllers);
        });
      });
    },
  };
};




/**
 * Creates a state connection or returns an active one
 *
 * @param {string} modelName the name of the model
 * @param {object} initConfig the initalizing configuration
 * @returns {object} the connection state
 */
const fetch = function ( modelName, initConfig ) {

  // If it doesn't exist or they sent us a config then create it
  if( !_connections[modelName] || !!initConfig ) {

    // No config? No problem
    if ( !initConfig ) {
      initConfig = {
        // empty
      };
    }

    // Set the default db to be the in-memory database
    if ( !initConfig.db ) {
      initConfig.db = {
        'type': 'memdb',
      };
    }

    _connections[modelName] = createModel( modelName, initConfig );
  } // ! _connetions[modelName]

  return _connections[modelName];
};



// TODO: add relationships
fetch.oneToMany = function( foreignModel ) {
  return {
    type: 'foreign-key',
    notNull: true,
    model: foreignModel,
  };
};




module.exports = fetch;
