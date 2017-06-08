'use strict';

const _ = require('lodash');

const schemaUtils = require('./schema');
const controller = require('./controller');
const connection = require('./connectors');

const createModel = function( modelName, initConfig ) {

  let controllerMethods = _.get(initConfig, 'methods', {});
  let schema = schemaUtils.create(initConfig.schema);
  let foreignKeys = schemaUtils.parseOutForeignKeys(initConfig.schema);
  let db = connection.create(modelName, initConfig.db, schema );

  return {
    connection: db,
    //
    name: modelName,
    data: initConfig,
    methods: controllerMethods,
    foreignKeys: foreignKeys,
    //
    create: function ( data ) {

      // Set the ids of the foreignkeys to reasonable things
      for( let field in foreignKeys ) {
        data[field] = data[field].id;
      }

      // Make sure all the schema data is in the data
      return schemaUtils.checkData( data, initConfig.schema)
      // If all's well, then start the connection and create the entry
      .then( schema => {
        return db.then( connection => {
          return connection.insert(data).then( data => {
            return controller.create(connection, data, controllerMethods, foreignKeys);
          });
        });
      });
    },
    //
    search: function ( predicate ) {
      return db.then( connection => {
        return connection.search(predicate).then( elements => {
          const controllers = [];
          for( var e in elements ) {
            controllers.push(
              controller.create(connection, elements[e], controllerMethods, foreignKeys)
            );
          }
          return Promise.all(controllers);
        });
      });
    },
    //
    get: function( predicate ) {
      return db.then( connection => {
        return connection.search(predicate).then( elements => {
          if( elements.length === 0) {
            return Promise.reject(`No results for ${modelName} with predicate ${predicate.toString()}`);
          }
          return controller.create(connection, elements[0], controllerMethods, foreignKeys);
        });
      });
    },
    //
    // TODO: Fixture loading
  };
};

module.exports.create = createModel;
