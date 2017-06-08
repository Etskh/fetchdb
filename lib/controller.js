'use strict';

const _ = require('lodash');

let fetchdb = null;

module.exports.create = function( db, data, controllerMethods, foreignKeys ) {

  // we need to return before we fetch - they haven't exported their
  // functions until we're in here.
  if( !fetchdb) {
    fetchdb = require('./fetch');
  }

  // Bind all the controller methods
  for( let m in controllerMethods ) {
    data[m] = controllerMethods[m].bind(this, data);
  }

  data.save = function() {
    // Set the foreignKeys to have ids saved instead of the
    // values!
    for( let field in foreignKeys ) {
      data[field] = data[field].id;
    }
    return db.update(data, { id: this.id, }).then( changes => {
      // if we didn't change anything, then
      // we need to insert a new field
      if( changes === 0 ) {
        // TODO: insert
      }

      return Promise.resolve(this);
    });
  };

  const foreignModels = [];
  for( let field in foreignKeys ) {
    foreignModels.push(
      fetchdb(foreignKeys[field].model).get({
        id: data[field],
      })
    );
  }
  return Promise.all(foreignModels).then( models => {
    for( let field in foreignKeys ) {
      data[field] = _.find(models, {
        id: data[field],
      });
    }
    return data;
  });

  return Promise.resolve(data);
};
