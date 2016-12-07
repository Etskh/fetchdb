'use strict';

const path = require('path');
const fs = require('fs');


const _configs = {
  // 'modelName': { <config> }
};


/**
 * Creates a connection to the in memory-database
 *
 * @param {string} modelName the name of the model table
 * @param {object} config configuration
 * @returns {promise} database connection
 */
const createJsonDb = function ( modelName, config ) {
  return new Promise( (resolve, reject) => {
    // Make sure we have what we need!
    if( !config.dir ) {
      return reject('No dir object in config');
    }

    // Initialise the array
    if ( !_configs[modelName] ) {
      _configs[modelName] = config;
    }


    const getModelFile = function(modelName) {
      return new Promise( (resolve, reject) => {
        const filePath = path.join( _configs[modelName].dir, modelName, '.js');
        fs.readFile( filePath, function( error, response) {
          if ( error ) {
            return reject( error );
          }
          return resolve(response);
        });
      });
    };




    return resolve({
      /**
       * Returns the number of elements in currently selected by the state
       * @returns {number} The number of elements in the state
       */
      count: function() {
        return _memoryDb[modelName].length;
      },
      /**
       * Creates a new entry and adds it to the database
       * @param {object} data The data to add
       * @returns {object} The data added
       */
      insert: function( data ) {
        data.id = ++_GUID;
        _memoryDb[modelName].push(data);
        return data;
      },
      /**
       * Selects data from the database
       * @returns {array} of {objects}
       */
      select: function( ) {
        // TODO: have a search algorithm or whatever
        return _memoryDb[modelName];
      },
    });
  });
};

module.exports = createJsonDb;
