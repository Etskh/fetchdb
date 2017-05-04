'use strict';

const sqlite3 = require('sqlite3');
const md5 = require('md5');
const logger = require('../logger');


const toWhereClause = function( predicate ) {
  const clauses = [];
  for( var field in predicate ) {
    clauses.push(`${field} = ${escapedField(predicate[field])}`);
  }
  return 'WHERE ' + (clauses.length > 0 ? clauses.join(' ') : '1' );
};


const toSqlType = function( schemaValue ) {
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


const createTableInfo = function(db, modelName, schema) {
  return createTableFromSchema(db, 'fetch_table_info', {
    model_name: 'string',
    schema: 'string',
    version: 'number',
  });
};



const tableExists = function( db, tableName ) {
  return new Promise( (resolve, reject) => {
    // Check that we have a table called 'tableName'
    let statement = 'SELECT * FROM sqlite_master WHERE type=\'table\' AND name = $name ';
    logger.debug({statement: statement,});
    db.get(statement, {
      $name: tableName,
    }, ( error, table ) => {
      if( error ) {
        return reject( error );
      }

      if( table ) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};


const createTableFromSchema = function(db, modelName, schema) {
  return new Promise( (resolve, reject ) => {
    // We need to create the table
    let createTable = `CREATE TABLE '${modelName}'`;
    let fields = [
      'id INTEGER UNIQUE NOT NULL PRIMARY KEY ASC AUTOINCREMENT',
    ];
    for( let field in schema ) {
      fields.push([
        field,
        toSqlType(schema[field].type),
        schema[field].notNull ? 'NOT NULL':'',
      ].join(' '));
    }
    let statement = createTable + ' (' + fields.join(', ') + ');';
    logger.debug({statement: statement,});
    db.run(statement, (err) => {
      if( err ) {
        return reject(err);
      }

      return resolve();
    });
  });
};





const createConnection = function(db, modelName, schema) {
  return {
    // Name
    name: modelName,
    // The schema that the model is based off of
    schema: schema,
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
        for ( let field in schema ) {
          fields.push( field );
          values.push( escapedField(data[field]) );
        }

        let statement = insertInto + ' (' + fields.join(', ') + ') VALUES (' + values.join(', ') + ')';
        logger.debug({statement: statement,});
        db.run(statement, function(err) {
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
        logger.debug({statement: statement,});
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
        logger.debug({statement: statement,});
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
      return new Promise( (resolve, reject) => {
        let statement = `UPDATE '${modelName}' SET `;
        const clauses = [];
        for( var field in schema ) {
          // ignore controller functions
          if ( typeof schema[field] === 'function') {
            continue;
          }
          clauses.push(`${field} = ${escapedField(data[field])}`);
        }
        statement += clauses.join(', ');
        statement += ` ${toWhereClause(predicate)}`;
        logger.debug({statement: statement,});
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



/*

// sqlite3 stuff in this one
sqlAbsLayer = {
  getConnection: ...returns connection...
  insertInto: returns the id
  toSqlType: ...
  select: returns the elements
  update: returns number of changed
  remove: returns number of changed
}

// this uses the SQL abs layer to do basic things
// This is where things like creating the tables happens

create = (modelName, dbConfig, schema) => {
  sqlAbsLayer.getConnection(dbConfig)
  .then( connection )
  return resolve({
    insert: function() {
      sqlAbsLayer.insertInto( connection, data,
    }
  });
}

db = {
  insert: () => {
    sqlAbsLayer->insertInto();
  }
  migrations...
  foreignKey...
}
*/





/**
 * Creates a connection to database
 *
 * @param {string} modelName the name of the model table
 * @param {object} dbConfig configuration object for the database
 * @param {object} schema the object schema
 * @returns {promise} database connection
 */
const createDb = function ( modelName, dbConfig, schema ) {

  if ( !dbConfig.filename ) {
    return Promise.reject('Database configuration needs a filename field');
  }

  return openDatabase(dbConfig).then( db => {
    const connection = createConnection(db, modelName, schema);

    return tableExists( db, modelName).then(doesTableExist => {
      if( doesTableExist ) {
        return connection;
      }

      return createTableFromSchema(db, modelName, schema).then( () => {
        return connection;
      });
    });
  });
};

module.exports.create = createDb;
