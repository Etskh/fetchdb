'use strict';

const expect = require('expect');

describe('lib/controller', function() {

  const controllerUtil = require('../../lib/controller');

  describe('#.create()', function() {
    it('can create a controller from a db, data, and methods', function(done) {

      const db = {
      };
      const data = {
        id: 1,
        username: 'admin',
        password: 'pass1',
      };
      const methods = {
        authenticate: function(self, password) {
          return self.password === password;
        },
      };

      controllerUtil.create(db, data, methods).then( (controller) => {

        // check that we have the data
        expect(controller.username).toEqual(data.username);
        expect(controller.password).toEqual(data.password);
        expect(controller.id).toEqual(data.id);

        // check that we have the methods
        expect(controller.authenticate).toExist();
        expect(controller.authenticate(data.password)).toEqual(true);

        done();
      }).catch(done);
    });
  });
});
