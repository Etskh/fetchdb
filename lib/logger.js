'use strict';

const bunyan = require('bunyan');

module.exports = bunyan.createLogger({
  name: 'fetchdb',
  // TODO: if the environemnt is DEV, then make this debug
  level: 0,
  //level: <level name or number>,      // Optional, see "Levels" section
  //stream: <node.js stream>,           // Optional, see "Streams" section
  //streams: [<bunyan streams>, ...],   // Optional, see "Streams" section
  //serializers: <serializers mapping>, // Optional, see "Serializers" section
  src: true,                     // Optional, see "src" section
  // Any other fields are added to all log records as is.
  //foo: 'bar',
  //...
});
