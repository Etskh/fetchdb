'use strict';

const expect = require('expect');
//const sinon = require('sinon');
//const fs = require('fs');


describe('lib / fetchdb', function() {

  const fetchdb = require('../lib/fetch2');
  const crypt = (str) => {
    return str;
  };
  const userModelConfig = {
    db: {
      type: 'memdb'
    },
    schema: {
      username: 'string',
      password: 'string',
    },
    methods: {
      authenticate: (self, password) => {
        return self.password === crypt(password);
      },
    },
  };
  const userData = {
    username: 'admin',
    password: 'pass1',
  };

  describe('.()', function() {
    it('can be initialised', function(done) {

      // just sets things and returns immediately
      // uses default memory database
      const userModel = fetchdb('user', userModelConfig );

      expect(userModel.data).toEqual(userModelConfig);
      expect(userModel.name).toEqual('user');
      expect(userModel.connection).toExist();
      expect(userModel.methods).toExist();

      done();
    });
  });
  describe('.create()', function() {
    it('can create a controller with methods and fields', function(done) {
      // just sets things and returns immediately
      // uses default memory database
      const userModel = fetchdb('user', userModelConfig );

      // Create a new entry in the model
      userModel.create(userData).then( (userController) => {
        // check userController
        // It adds the methods that we pass it
        expect(userController.id).toExist();
        expect(userController.username).toEqual(userData.username);
        expect(userController.password).toEqual(userData.password);
        // Make sure custom controller methods exist and work
        expect(userController.authenticate).toExist();
        expect(userController.authenticate(userData.password)).toEqual(true);
        // Make sure built-in controller methods work
        expect(userController.save).toExist();
        done();
      });
    });
  });

});
