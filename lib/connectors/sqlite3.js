'use strict';

const sqlite3 = require('sqlite3');
const md5 = require('md5');


const toWhereClause = function( predicate ) {
  const clauses = [];
  for( var field in predicate ) {
    clauses.push(`${field} = ${escapedField(predicate[field])}`);
  }
  return 'WHERE ' + (clauses.length > 0 ? clauses.join(' ') : '1' );
};


const toSqlite3Type = function( schemaValue ) {
  switch( schemaValue ) {
  case 'number':
    return 'DOUBLE PRECISION';
  case 'string':
    return 'TEXT';
  }
  return 'INTEGER';
};


const escapedField = function( value ) {
  if ( typeof value === 'string' ) {
    return '"' + value + '"';
  }
  return value;
};



const createConnection = function(db, modelName, schema) {
  return {
    /**
     * Creates a new entry and adds it to the database
     * @param {object} data The data to add
     * @returns {object} The data added
     */
    insert: function( data ) {
      return new Promise( (resolve, reject) => {
        let insertInto = `INSERT INTO '${modelName}'`;
        let fields = [];
        let values = [];
        for ( let field in data ) {
          fields.push( field );
          values.push( escapedField(data[field]) );
        }

        let statement = insertInto + ' (' + fields.join(', ') + ') VALUES (' + values.join(', ') + ')';
        //console.log(`Running statement ${statement}`);
        db.run(statement, function(err, next) {
          if( err ) {
            return reject(err);
          }

          data.id = this.lastID;
          return resolve(data);
        });
      });
    },
    /**
     * Selects data from the database that match the predicate
     * @param {object} predicate the filter agent to match
     * @returns {array} of {objects}
     */
    search: function( predicate ) {
      return new Promise( (resolve, reject) => {
        let statement = `SELECT * FROM '${modelName}' ${toWhereClause(predicate)}`;
        db.all(statement, function(err, data) {
          if( err ) {
            return reject(err);
          }
          return resolve(data);
        });
      });
    },
    /**
     * Removes elements that match the predicate
     * @param {object} predicate the filter agent to match
     * @returns {number} of objects removed
     */
    remove: function( predicate ) {
      return new Promise( (resolve, reject) => {
        let statement = `DELETE FROM '${modelName}' ${toWhereClause(predicate)}`;
        db.run(statement, function(err) {
          if( err ) {
            return reject(err);
          }
          return resolve(this.changes);
        });
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
        let statement = `UPDATE '${modelName}' SET `;
        const clauses = [];
        for( var field in data ) {
          clauses.push(`${field} = ${escapedField(data[field])}`);
        }
        statement += clauses.join(', ');
        statement += ` ${toWhereClause(predicate)}`;
        db.run(statement, function(err) {
          if( err ) {
            return reject(err);
          }
          return resolve(this.changes);
        });
      });
    },
  };
};



const databases = {};

const openDatabase = function( dbConfig ) {
  return new Promise( (resolve, reject) => {
    const dbHash = md5(JSON.stringify(dbConfig));
    if( databases[dbHash] ) {
      return resolve(databases[dbHash]);
    }

    databases[dbHash] = new sqlite3.Database(dbConfig.filename, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, ( error ) => {
      if ( error ) {
        return reject(error);
      }

      return resolve(databases[dbHash]);
    });
  });
};




/**
 * Creates a connection to the in memory-database
 *
 * @param {string} modelName the name of the model table
 * @param {object} dbConfig configuration object for the database
 * @param {object} schema the object schema
 * @returns {promise} database connection
 */
const createDb = function ( modelName, dbConfig, schema ) {
  return new Promise( (resolve, reject) => {

    if ( !dbConfig.filename ) {
      return reject('Database configuration needs a filename field');
    }

    openDatabase(dbConfig).then( db => {

      // Check that we have a table called 'modelName'
      db.get('SELECT name FROM sqlite_master WHERE type=\'table\' AND name = $name ', {
        $name: modelName,
      }, ( error, table ) => {
        if( error ) {
          return reject( error );
        }

        // The table exists, let's resolve
        if( table ) {
          return resolve(createConnection(db, modelName, schema));
        }

        // We need to create the table
        let createTable = `CREATE TABLE '${modelName}'`;
        let fields = [
          'id INTEGER UNIQUE NOT NULL PRIMARY KEY ASC AUTOINCREMENT',
        ];
        for( let field in schema ) {
          fields.push( field + ' ' + toSqlite3Type(schema[field]));
        }
        let statement = createTable + ' (' + fields.join(', ') + ');';

        //console.log(`Running statement ${statement}`);
        db.run(statement, (err) => {
          if( err ) {
            return reject(err);
          }

          return resolve(createConnection(db, modelName, schema));
        });
      });
    });
  });
};

module.exports.create = createDb;
