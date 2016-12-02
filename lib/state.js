'use strict';

//
// TODO: export to its module
//
const createController = function ( data ) {
  return new Promise( (resolve) => {
    return resolve(data);
  });
};



module.exports.create = function ( connectionPromise ) {
  const info = function() {
    return connectionPromise.then( (connection) => {
      return {
        type: connection.db.type,
        name: connection.name,
        count: connection.db.count(),
      };
    });
  };

  const create = function(data) {
    return connectionPromise.then( (connection) => {
      data = connection.db.insert(data);
      return createController(data);
    });
  };

  const get = function() {
    return connectionPromise.then( (connection) => {
      const datas = connection.db.select();
      return datas;
    });
  };

  return {
    connection: connectionPromise,
    info: info,
    create: create,
    get: get,
  };
};
