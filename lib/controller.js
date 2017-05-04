'use strict';

module.exports.create = function( db, data, controllerMethods ) {
  return new Promise( resolve => {

    // Create a controller from the data
    for( let m in controllerMethods ) {
      data[m] = controllerMethods[m].bind(this, data);
    }


    data.save = function() {
      return db.update(data, { id: this.id }).then( changes => {
        // if we didn't change anything, then
        // we need to insert a new field
        if( changes === 0 ) {
          // TODO: insert
        }

        return Promise.resolve(this);
      });
    };

    return resolve(data);
  });
};
