'use strict';


// our amazing memory database
const _memoryDb = {};
// starting with this id
let _GUID = 0xBEEF;

// create the memory database
const createMemoryDb = function ( modelName ) {

  // Initialise the array
  if ( !_memoryDb[modelName] ) {
    _memoryDb[modelName] = [];
  }


  return {
    count: function() {
      return _memoryDb[modelName].length;
    },
    insert: function( data ) {
      data.id = ++_GUID;
      _memoryDb[modelName].push(data);
      return data;
    },
    select: function( ) {
      // TODO: have a search algorithm or whatever
      return _memoryDb[modelName];
    },
  };
};

module.exports = createMemoryDb;
