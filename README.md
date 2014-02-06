heroku-mongo-pull
=================

Pull a Mongodb database used by your Heroku app to localhost using mongodump / mongorestore.

## Install

  $ heroku plugins:install https://github.com/arvida/heroku-mongo-pull.git
  
## Usage

  $ heroku mongo:pull
  
This will replace the database with the same name as your app on localhost with the database specified by your apps Heroku config.

The databased replaced can be specified by setting the `MONGO_URL` env variables:

   $ MONGO_URL=mongodb://username:password@localhost:9999/my-database heroku mongo:pull 
