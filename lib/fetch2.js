'use strict';

const _ = require('lodash');


const controller = require('./controller');


const _connections = {
  // empty
};


const connection = {
  create: function ( modelName, dbConfig ) {
    return require('./connectors/memory')(modelName, {});
  },
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

    let db = connection.create(modelName, initConfig.db );
    let controllerMethods = _.get(initConfig, 'methods', {});

    _connections[modelName] = {
      connection: db,
      name: modelName,
      data: initConfig,
      methods: controllerMethods,
      create: function ( data ) {
        return db.then( (connection) => {
          return connection.insert(data).then( (data) => {
            return controller.create(db, data, controllerMethods);
          });
        });
      },
    };
  } // ! _connetions[modelName]

  return _connections[modelName];
};


module.exports = fetch;
