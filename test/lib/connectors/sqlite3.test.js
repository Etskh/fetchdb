'use strict';

const expect = require('expect');

describe('lib/connectors/sqlite3', function() {

  const sqliteDb = require('../../../lib/connectors/sqlite3');
  const config = {
    filename: ':memory:',
  };
  const schema = {
    username: 'string',
    password: 'string',
    age: 'number',
  };


  describe('#create()', function() {
    it('will create a connector with functions', function(done) {

      sqliteDb.create('this-is-a-new-model', config, schema ).then( (db) => {
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
      const sqlite = sqliteDb.create('myModel', config, schema );
      const inputData = {
        username: 'admin',
        password: 'pass1',
        age: 23
      };
      sqlite.then( (db) => {
        return db.insert( inputData ).then( (data) => {
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
      username: 'new user',
      password: 'pass1',
      age: 23
    };
    it('can search existing elements', function(done) {
      const sqlite = sqliteDb.create('myModel', config, schema );
      sqlite.then( (db) => {
        return db.insert( inputData ).then( (data) => {
          return db.search({ username: inputData.username }).then( (elements) => {
            expect(elements.length).toEqual(1);
            done();
          });
        }).catch(done);
      });
    });
  });

  describe('#.remove()', function() {
    const inputData = {
      username: 'removed user',
      password: 'pass1',
      age: 23,
    };
    it('can remove existing elements', function(done) {
      const sqlite = sqliteDb.create('myModel', config, schema );
      sqlite.then( (db) => {
        return db.insert( inputData ).then( (data) => {
          return db.remove({ username: inputData.username }).then( (count) => {
            expect(count).toEqual(1);
            return db.search({ username: inputData.username }).then( (elements) => {
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
      username: 'not updated user',
      password: 'pass1',
      age: 23,
    };
    const newName = 'updated user';
    it('can update existing elements', function(done) {
      const sqlite = sqliteDb.create('myModel', config, schema );
      sqlite.then( (db) => {
        return db.insert( inputData ).then( (data) => {
          return db.update({ username: newName }, { username: inputData.username }).then( (count) => {
            expect(count).toEqual(1);
            return db.search({ username: newName }).then( (elements) => {
              expect(elements.length).toEqual(1);
              expect(elements[0].value).toEqual(newName);
              done();
            });
          });
        }).catch(done);
      });
    });
  });
});
