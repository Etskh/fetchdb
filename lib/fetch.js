'use strict';

const _ = require('lodash');

const model = require('./model');

const _connections = {
  // empty
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

    _connections[modelName] = model.create( modelName, initConfig );
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
fetch.foreignKey = fetch.oneToMany;


module.exports = fetch;
