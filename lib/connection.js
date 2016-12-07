'use strict';


/**
 * Creates a connection to a database
 *
 * @param {string} modelName the name of the model (table)
 * @param {object} config the configuration of the database
 *
 * @returns {promise} the connection to the database
 */
module.exports.create = function ( modelName, config ) {
  return new Promise( (resolve) => {
    let db = null;

    switch(config.type) {
    case 'memdb':
      db = require('./connectors/memory')(modelName, {});
      break;
    case 'json':
      db = require('./connectors/json')(modelName, config);
      break;
    default:
      // TODO: Freak out
    }

    return db.then( (db) => {
      db.type = config.type;

      return resolve({
        name: modelName,
        db: db,
      });
    });
  });
};
