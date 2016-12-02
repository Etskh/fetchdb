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

});
