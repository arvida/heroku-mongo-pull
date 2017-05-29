'use strict';

let os = require('os');
let fs = require('fs');
let path = require('path');
let child_process = require('child_process');
let cli = require('heroku-cli-util');
let co = require('co');
let parseMongodbUri = require('mongodb-url');

function* pull (context, heroku) {
  let res = yield {
      app: heroku.apps(context.app).info(),
      config: heroku.apps(context.app).configVars().info()
    },
    source = parseMongodbUri(extractSourceUriFromConfig(res.config)),
    target = parseMongodbUri(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/' + res.app.name),
    dumpDir = createDumpDirectory(),
    dumpCommand = ['mongodump'].concat(commandOptionsFromConnectionSettings(source)),
    restoreCommand = ['mongorestore'].concat(commandOptionsFromConnectionSettings(target));

  dumpCommand.push('--out', dumpDir);
  child_process.execSync(dumpCommand.join(' '), { stdio: [0, 1, 2] });

  restoreCommand.push('--drop');
  restoreCommand.push(path.join(dumpDir, source.dbName));
  if (context.flags.noIndexRestore) {
    restoreCommand.push("--noIndexRestore");
  }

  child_process.execSync(restoreCommand.join(' '), { stdio: [0, 1, 2] });
  child_process.execSync('rm -r ' + dumpDir, { stdio: [0, 1, 2] }); // `fs.rmdir` cannot delete non empty folders
}

function extractSourceUriFromConfig(config) {
  return config['MONGODB_REPLICASET_URI'] ||
    config['MONGODB_URI'] ||
    config['MONGO_URL'] ||
    config['MONGOHQ_URL'] ||
    config['MONGOLAB_URI'];
}

function commandOptionsFromConnectionSettings(uri) {
  var options = [];

  if (uri.rs_options.rs_name) {
    let hosts = uri.servers.map(function(server) {
      return server.host + ':' + server.port;
    });

    options.push('--host', uri.rs_options.rs_name + '/' + hosts.join(','));
  } else {
    options.push('--host', uri.servers[0].host + ':' + uri.servers[0].port);
  }

  if (uri.auth) {
    options.push('--username', uri.auth.user);
    options.push('--password', uri.auth.password);
  }

  options.push('--db', uri.dbName);

  return options;
}

function createDumpDirectory() {
  let name = path.join(os.tmpdir(), 'mongopull-tmp-' + process.pid);

  fs.mkdirSync(name, 448);

  return name;
}

module.exports = {
  topic: 'mongo',
  command: 'pull',
  description: 'Pull database to localhost',
  help: '',
  needsApp: true,
  needsAuth: true,
  flags: [
    { name: 'noIndexRestore', description: 'skip index restore' }
  ],
  run: cli.command(co.wrap(pull))
};
