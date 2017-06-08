'use strict';

const createConnection = function ( modelName, dbConfig, schema ) {

  switch( dbConfig.type ) {
  case 'memdb':
    return require('./memory').create(modelName, dbConfig, schema);
  case 'sqlite3':
    return require('./sqlite3').create(modelName, dbConfig, schema);
  }

  return new Promise( ( resolve, reject ) => {
    return reject('No database connection by the name ' + dbConfig.type );
  });
};


module.exports.create = createConnection;
