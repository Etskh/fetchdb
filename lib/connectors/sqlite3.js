'use strict';



const sqlite3 = require('sqlite3');
const md5 = require('md5');
const logger = require('../logger');









const escapedField = function( value ) {
  if ( typeof value === 'string' ) {
    return '"' + value + '"';
  }
  return value;
};

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





const insertInto = function( sal, tableName, schema, data ) {

  let fields = [];
  let values = [];
  for ( let field in schema ) {
    if( typeof schema[field] === 'function' ) {
      continue;
    }
    fields.push( field );
    values.push( escapedField(data[field]) );
  }

  let statement = [
    `INSERT INTO \`${tableName}\``,
    ['(\`', fields.join('\`, \`'),'\`)',].join(''),
    'VALUES',
    '(',values.join(', '),')',
  ].join(' ');

  return sal.run(statement).then((statement) => {
    data.id = statement.lastID;
    return data;
  });
};

const selectFrom = function( sal, tableName, schema, predicate ) {
  let statement = `SELECT * FROM \`${tableName}\` ${toWhereClause(predicate)}`;
  return sal.run(statement).then( (statement) => {
    return statement.data;
  });
};

const update = function( sal, tableName, schema, data, predicate ) {

  const clauses = [];
  for( var field in schema ) {
    // ignore controller functions
    if ( typeof schema[field] === 'function') {
      continue;
    }
    // if we weren't asked to update it, then don't
    if( !data[field] ) {
      continue;
    }
    clauses.push(`\`${field}\` = ${escapedField(data[field])}`);
  }

  let statement =
    `UPDATE \`${tableName}\` SET ` +
    clauses.join(', ') +
    ` ${toWhereClause(predicate)}`;

  return sal.run(statement).then( statement => {
    return statement.changes;
  });
};

const removeFrom = function( sal, tableName, schema, predicate ) {
  let statement = `DELETE FROM \`${tableName}\` ${toWhereClause(predicate)}`;
  return sal.run(statement).then( statement => {
    return statement.changes;
  });
};


const tableExists = function( sal, tableName ) {
  return new Promise( (resolve, reject) => {
    // Check that we have a table called 'tableName'
    let statement = 'SELECT * FROM sqlite_master WHERE type=\'table\' AND name = $name ';
    logger.debug({statement: statement,});
    sal.db.get(statement, {
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


const createTable = function( sal, tableName, schema ) {
  let fields = [
    'id INTEGER UNIQUE NOT NULL PRIMARY KEY ASC AUTOINCREMENT',
  ];
  for( let field in schema ) {
    fields.push([
      `\`${field}\``,
      toSqlType(schema[field].type),
      schema[field].notNull ? 'NOT NULL' : '',
    ].join(' '));
  }
  let statement = `CREATE TABLE \`${tableName}\`` + ' (' + fields.join(', ') + ');';
  return sal.run(statement);
};


const _databases = {};
const createConnection = (dbConfig) => {
  return new Promise( (resolve, reject ) => {
    // SQLite needs a filename
    if ( !dbConfig.filename ) {
      return reject('Database configuration needs a filename field');
    }

    // If we already have a stored version of the database connector
    const dbHash = md5(JSON.stringify(dbConfig));
    if( _databases[dbHash] ) {
      return resolve(_databases[dbHash]);
    }

    // Instantiate the database
    _databases[dbHash] = new sqlite3.Database(dbConfig.filename, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, err => {
      if ( err ) {
        return reject(err);
      }

      return resolve(_databases[dbHash]);
    });
  });
};



const getSqlAbstractionLayer = (dbConfig) => {
  // First we create our database connection
  return createConnection(dbConfig).then( db => {

    return {
      // get the database
      db: db,
      // run statement
      run: function(statement) {
        return new Promise( (resolve, reject) => {
          logger.debug({statement: statement,});
          var operation = 'run';
          if( statement.indexOf('SELECT') === 0 ) {
            operation = 'all';
          }
          db[operation](statement, function(err, data) {
            if( err ) {
              return reject(err);
            }
            return resolve({
              lastID: this.lastID,
              changes: this.changes,
              statement: this,
              data: data,
            });
          });
        });
      },
      // INSERT INTO `table` ...
      insertInto: insertInto,
      // SELECT * FROM ...
      selectFrom: selectFrom,
      // UPDATE `table` ...
      update: update,
      // DELETE FROM ...
      removeFrom: removeFrom,

      // create table if it doesn't exist
      createTable: (sal, tableName, schema) => {
        return tableExists(sal, tableName).then(doesExist => {
          if( doesExist ) {
            return true;
          }
          return createTable(sal, tableName, schema);
        });
      },
      // table exists
      tableExists: tableExists,
    };
  });
};






/**
 * Creates a connection to database
 *
 * @param {string} modelName the name of the model table
 * @param {object} dbConfig configuration object for the database
 * @param {object} schema the object schema
 * @returns {promise} database connection
 */
module.exports.create = function ( modelName, dbConfig, schema ) {
  //
  // TODO: what this returns should be the same no matter
  // what kind of SQL language we use (should-be table-based)
  //

  return getSqlAbstractionLayer(dbConfig)
  .then( sal => {
    return sal.createTable(sal, modelName, schema).then( ()=> {
      return {
        // insert
        insert: (data) => {
          return sal.insertInto(sal, modelName, schema, data);
        },
        // search
        search: (predicate) => {
          return sal.selectFrom(sal, modelName, schema, predicate );
        },
        // update
        update: (data, predicate) => {
          return sal.update(sal, modelName, schema, data, predicate );
        },
        // remove
        remove: (predicate) => {
          return sal.removeFrom(sal, modelName, schema, predicate );
        },
      };
    });
  });
};
