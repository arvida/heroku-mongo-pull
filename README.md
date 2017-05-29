heroku-mongo-pull
=================

Pull a Mongodb database used by your Heroku app to localhost using `mongodump` / `mongorestore` commands.

## Install

    $ heroku plugins:install heroku-mongo-pull
  
## Usage

    $ heroku mongo:pull
  
This will replace the database with the same name as your app on localhost with the database specified by your apps Heroku config.

The databased replaced can be specified by setting the `MONGO_URL` env variables:

    $ MONGO_URL=mongodb://username:password@localhost:9999/my-database heroku mongo:pull 

### Options    

    $ heroku mongo:pull --noIndexRestore
    
This will skip index restoration when importing the data. This can be usefull if you are using different versions of MongoDB and just want to import the data.
