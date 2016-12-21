'use strict';


// This is storage for the active connections
const _connections = {
  // empty
};


const connection = require('./connection');
const state = require('./state');



/**
 * Creates a state connection or returns an active one
 *
 * @param {string} modelName the name of the model
 * @returns {object} the connection state
 */
const fetch = function ( modelName ) {
  // If it doesn't exist, then create it
  if( !_connections[modelName] ) {
    _connections[modelName] = connection.create(modelName, {
      type: 'memdb',
    });
  }
  return state.create(_connections[modelName]);
};


module.exports = fetch;
