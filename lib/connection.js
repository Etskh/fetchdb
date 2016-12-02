'use strict';


module.exports.create = function ( modelName, config ) {
  return new Promise( (resolve) => {
    let db = null;

    switch(config.type) {
    case 'memdb':
      db = require('./connectors/memory')(modelName, {});
      break;
    default:
      // TODO: Freak out
    }

    db.type = config.type;

    return resolve({
      name: modelName,
      db: db,
    });
  });
};
