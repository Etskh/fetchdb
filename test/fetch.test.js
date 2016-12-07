'use strict';

const expect = require('expect');
//const sinon = require('sinon');
//const fs = require('fs');


describe('lib / fetchdb', function() {

  it('can be initialised', function(done) {
    const fetchdb = require('../lib/fetch2');
    const crypt = (str) => {
      return str;
    };
    const userModelConfig = {
      schema: {
        username: 'string',
        password: 'string',
      },
      methods: {
        authenticate: (password) => {
          return this.password === crypt(password);
        },
      },
    };

    // just sets things and returns immediately
    // uses default memory database
    const userModel = fetchdb('user', userModelConfig );

    expect(userModel.data).toEqual(userModelConfig);
    expect(userModel.name).toEqual('user');
    expect(userModel.connection).toExist();
    expect(userModel.methods).toExist();

    // Create a new entry in the model
    userModel.create({
      username: 'admin',
      password: 'pass1',
    }).then( (userController) => {
      // check userController
      expect(userController.authenticate).toExist();

      done();
    });
  });

  /*const fetchdb = require('../lib/fetchdb');
  const modelName = 'model';
  const model = fetchdb(modelName);

  it('can call info that returns an info block about the state', function(done) {

    // create a new connector and model without config
    model.info().then( (info) => {
      expect(info).toEqual({
        type: 'memdb',
        name: modelName,
        count: 0,
      });
      done();
    });
  });

  it('inmemory database can add new items', function(done) {
    const toInsert = {
      name: 'some data',
    };
    const db = require('../lib/connectors/memory');
    const oldCount = db(modelName).count();
    const insertedElement = db(modelName).insert(toInsert);

    expect(db(modelName).count()).toEqual( oldCount + 1);
    toInsert.id = insertedElement.id;
    expect(insertedElement).toEqual(toInsert);
    done();
  });*/
});
