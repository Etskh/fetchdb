'use strict';

/**
 * Creates a controller for data
 *
 * @param {object} data The raw data
 * @returns {promise} of controller
 */
const createController = function ( data ) {
  return new Promise( (resolve) => {
    return resolve(data);
  });
};


/**
 * This creates a connectionState
 *
 * @param {promise} connectionPromise a promise containing the database connection
 *
 * @returns {object} The connection state
 */
module.exports.create = function ( connectionPromise ) {

  /**
    Gets the information of the connection as an object
    @returns {object} of connection information
   */
  const info = function() {
    return connectionPromise.then( (connection) => {
      return {
        type: connection.db.type,
        name: connection.name,
        count: connection.db.count(),
      };
    });
  };

  const create = function(data) {
    return connectionPromise.then( (connection) => {
      data = connection.db.insert(data);
      return createController(data);
    });
  };

  const get = function() {
    return connectionPromise.then( (connection) => {
      return connection.db.select();
    });
  };

  return {
    connection: connectionPromise,
    info: info,
    create: create,
    get: get,
  };
};
