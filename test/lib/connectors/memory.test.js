'use strict';

const expect = require('expect');

describe('lib/connectors/memory', function() {

  const memory = require('../../../lib/connectors/memory');

  describe('#.create()', function() {
    it('will create a connector with functions', function(done) {

      memory.create('this-is-a-new-model').then( (db) => {
        expect(db.insert).toExist();
        expect(db.search).toExist();
        expect(db.remove).toExist();
        expect(db.update).toExist();
        done();
      }).catch(done);
    });
  });

  describe('#.insert()', function() {
    it('can insert a new data-point', function(done) {
      const inputData = {
        username: 'admin',
        age: 23
      };
      memory.create('userthing').then( (db) => {
        db.insert( inputData ).then( (data) => {
          expect(data.id).toExist();
          expect(data.username).toEqual(inputData.username);
          expect(data.age).toEqual(inputData.age);
          done();
        }).catch(done);
      });
    });
  });

  describe('#.search()', function() {
    const inputData = {
      value: 0xB33F,
    };
    it('can search existing elements', function(done) {
      memory.create('userthing').then( (db) => {
        db.insert( inputData ).then( (data) => {
          db.search({ value: inputData.value }).then( (elements) => {
            expect(elements.length).toEqual(1);
            done();
          });
        }).catch(done);
      });
    });
  });

  describe('#.remove()', function() {
    const inputData = {
      value: 0xFACE,
    };
    it('can remove existing elements', function(done) {
      memory.create('userthing').then( (db) => {
        db.insert( inputData ).then( (data) => {
          db.remove({ value: inputData.value }).then( (count) => {
            expect(count).toEqual(1);
            return db.search({ value: inputData.value }).then( (elements) => {
              // it should be removed... obvs
              expect(elements.length).toEqual(0);
              done();
            });
          });
        }).catch(done);
      });
    });
  });

  describe('#.update()', function() {
    const inputData = {
      value: 0xFACE,
    };
    const newValue = 0xBEEF;
    it('can update existing elements', function(done) {
      memory.create('userthing').then( (db) => {
        db.insert( inputData ).then( (data) => {
          db.update({ value: newValue }, { value: inputData.value }).then( (count) => {
            expect(count).toEqual(1);
            return db.search({ value: newValue }).then( (elements) => {
              // it should be removed... obvs
              expect(elements.length).toEqual(1);
              expect(elements[0].value).toEqual(newValue);
              done();
            });
          });
        }).catch(done);
      });
    });
  });
});
