'use strict';

const bunyan = require('bunyan');

module.exports = bunyan.createLogger({
  name: 'fetchdb',
  // TODO: if the environemnt is DEV, then make this debug
  level: 0,
  /*
  "fatal" (60): The service/app is going to stop or become unusable now. An operator should definitely look into this soon.
  "error" (50): Fatal for a particular request, but the service/app continues servicing other requests. An operator should look at this soon(ish).
  "warn" (40): A note on something that should probably be looked at by an operator eventually.
  "info" (30): Detail on regular operation.
  "debug" (20): Anything else, i.e. too verbose to be included in "info" level.
  "trace" (10): Logging from external libraries used by your app or very detailed application logging.
  */
  //stream: <node.js stream>,           // Optional, see "Streams" section
  //streams: [<bunyan streams>, ...],   // Optional, see "Streams" section
  //serializers: <serializers mapping>, // Optional, see "Serializers" section
  src: true,                     // Optional, see "src" section
  // Any other fields are added to all log records as is.
  //foo: 'bar',
  //...
});
