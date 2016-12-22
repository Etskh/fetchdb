'use strict';

module.exports.create = function( db, data, controllerMethods ) {
  return new Promise( (resolve) => {

    // Create a controller from the data
    for( let m in controllerMethods ) {
      data[m] = controllerMethods[m].bind(this, data);
    }

    /*
    // TODO: implement save
    data.save = function() {
    };
    */

    return resolve(data);
  });
};