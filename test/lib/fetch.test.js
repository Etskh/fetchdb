'use strict';

const expect = require('expect');
//const sinon = require('sinon');
//const fs = require('fs');


describe('lib/fetchdb', function() {

  const fetchdb = require('../../lib/fetch');
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

  describe('#()', function() {
    it('passing a config will create a connection', function(done) {
      const userModel = fetchdb('user', userModelConfig );

      expect(userModel.data).toEqual(userModelConfig);
      expect(userModel.name).toEqual('user');
      expect(userModel.connection).toExist();
      expect(userModel.methods).toExist();

      done();
    });
    it('will create a memory db if no initConfig is passed', function(done) {
      // just sets things and returns immediately
      // uses default memory database
      const modelName = 'model-that-doesnt-exist';
      const model = fetchdb(modelName);

      expect(model.name).toEqual(modelName);
      expect(model.connection).toExist();
      done();
    });
    it('not passing a config will return the already created connection', function(done) {
      const userModel = fetchdb('user');

      expect(userModel.data).toEqual(userModelConfig);
      expect(userModel.name).toEqual('user');
      expect(userModel.connection).toExist();
      expect(userModel.methods).toExist();

      done();
    });
  });
  describe('#create()', function() {
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
        // TODO: implement these built-in methods
        //expect(userController.save).toExist();
        //expect(userController.delete).toExist();
        done();
      }).catch(done);
    });
  });
  describe('#search()', function() {
    it('will return an array of controllers', function(done) {
      // just sets things and returns immediately
      // uses default memory database
      const userModel = fetchdb('user');

      // Create a new entry in the model
      userModel.search({ username: userData.username })
      .then( ( userControllers ) => {
        expect(userControllers.length).toEqual(1);
        done();
      }).catch(done);
    });
  });
});
