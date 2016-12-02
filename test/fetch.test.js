'use strict';

const expect = require('expect');
//const sinon = require('sinon');
//const fs = require('fs');


describe('lib / fetchdb', function() {

  const fetchdb = require('../lib/fetchdb');
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
      name: 'some data'
    };
    const db = require('../lib/connectors/memory');
    const oldCount = db(modelName).count();
    const insertedElement = db(modelName).insert(toInsert);

    expect(db(modelName).count()).toEqual( oldCount + 1);
    toInsert.id = insertedElement.id;
    expect(insertedElement).toEqual(toInsert);
    done();
  });

});
