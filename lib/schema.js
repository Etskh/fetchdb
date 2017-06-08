'use strict';


const validateSchema = function( schema ) {
  // TODO: implement me and check me on creating a model
  for( let field in schema ) {
    // Check type
    switch( schema[field].type ) {
    case 'string':
    case 'number':
    case 'foreign-key':
      // empty
      break;
    default:
      return Promise.reject(`Unknown field type for ${field}: ${schema[field].type}`);
    }
  }
  return Promise.resolve(schema);
};


const createSchema = function( schema ) {
  // now we'll make the schema into object so that it can be used
  // by the connectors
  for( let field in schema ) {
    if( typeof schema[field] === 'string' ) {
      schema[field] = {
        type: schema[field],
        notNull: true,
      };
    }
  }

  return schema;
};


const checkSchemaData = function( data, schema ) {
  for( let field in schema ) {
    if( !data[field] ) {
      return Promise.reject(`Field ${field} does not exist in the creation data`);
    }
  }
  return Promise.resolve(schema);
};


const parseOutForeignKeys = function( schema ) {
  const keys = {};

  for( let field in schema ) {
    if( schema[field].type === 'foreign-key') {
      keys[field] = schema[field];
    }
  }

  return keys;
};


module.exports.create = createSchema;
module.exports.checkData = checkSchemaData;
module.exports.validate = validateSchema;
module.exports.parseOutForeignKeys = parseOutForeignKeys;
