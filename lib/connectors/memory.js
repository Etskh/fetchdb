'use strict';

const _ = require('lodash');


// our amazing memory database
const _memoryDb = {};
// starting with this id
let _GUID = 0xBEEF;


/**
 * Creates a connection to the in memory-database
 *
 * @param {string} modelName the name of the model table
 * @param {object} dbConfig configuration object for the database
 * @param {object} schema the object schema
 * @returns {promise} database connection
 */
const createMemoryDb = function ( modelName, dbConfig, schema ) {
  return new Promise( (resolve) => {

    // Initialise the array
    if ( !_memoryDb[modelName] ) {
      _memoryDb[modelName] = [];
    }

    return resolve({
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
       * Selects data from the database that match the predicate
       * @param {object} predicate the filter agent to match
       * @returns {array} of {objects}
       */
      search: function( predicate ) {
        return new Promise( (resolve) => {
          return resolve(_.filter(_memoryDb[modelName], predicate ));
        });
      },
      /**
       * Removes elements that match the predicate
       * @param {object} predicate the filter agent to match
       * @returns {number} of objects removed
       */
      remove: function( predicate ) {
        return new Promise( (resolve) => {
          return resolve(_.remove(_memoryDb[modelName], predicate).length);
        });
      },
      /**
       * Updates all elements that match predicate to have new data 'data'
       * @param {object} data The data to update
       * @param {object} predicate the filter agent to match
       * @returns {number} of objects updated
       */
      update: function( data, predicate ) {
        return new Promise( (resolve) => {
          const elements = _.filter(_memoryDb[modelName], predicate);
          let counter = 0;
          for ( let e in elements ) {
            for ( let field in data ) {
              elements[e][field] = data[field];
            }
            ++counter;
          }
          return resolve(counter);
        });
      },
    });
  });
};

module.exports.create = createMemoryDb;
