'use strict';


// our amazing memory database
const _memoryDb = {};
// starting with this id
let _GUID = 0xBEEF;


/**
 * Creates a connection to the in memory-database
 *
 * @param {string} modelName the name of the model table
 * @returns {promise} database connection
 */
const createMemoryDb = function ( modelName ) {
  return new Promise( (resolve) => {

    // Initialise the array
    if ( !_memoryDb[modelName] ) {
      _memoryDb[modelName] = [];
    }

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
        return new Promise( (resolve) => {
          data.id = ++_GUID;
          _memoryDb[modelName].push(data);
          return resolve(data);
        });
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

module.exports = createMemoryDb;
