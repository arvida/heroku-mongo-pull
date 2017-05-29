'use strict';

exports.topic = {
  name: 'mongo',
  description: 'Pull a MongoDB database used by your Heroku app to localhost',
};

exports.commands = [
  require('./commands/pull.js')
];
