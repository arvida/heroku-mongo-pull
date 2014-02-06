class Heroku::Command::Mongo < Heroku::Command::Base
  # mongo:pull
  #
  # pull heroku mongodb database to localhost

  def pull
    display "Replacing database at #{local_mongo_uri.host}#{local_mongo_uri.path} with #{heroku_mongo_uri.host}#{heroku_mongo_uri.path}"
    replace heroku_mongo_uri, local_mongo_uri
  end

  private

  def replace from, to
    dir = Dir.mktmpdir

    from_db = from.path.gsub(/^\//, "")

    dump_commad = ["mongodump"]
    dump_commad << "--host #{from.hostname}"
    dump_commad << "--port #{from.port}"
    dump_commad << "--username #{from.user}" if from.user
    dump_commad << "--password #{from.password}" if from.password
    dump_commad << "--db #{from_db}"
    dump_commad << "--out=#{dir}"

    system dump_commad.join(" ")
    display " Done downloading"

    to_db = to.path.gsub(/^\//, "")

    restore_commad = ["mongorestore"]
    restore_commad << "--host #{to.hostname}"
    restore_commad << "--port #{to.port}"
    restore_commad << "--username #{to.user}" if to.user
    restore_commad << "--password #{to.password}" if to.password
    restore_commad << "--db #{to_db}"
    restore_commad << "#{dir}/#{from_db}"

    system restore_commad.join(" ")
    display " Done importing"

    FileUtils.remove_entry_secure dir
  end

  def heroku_mongo_uri
    url = config["MONGO_URL"] || config["MONGOHQ_URL"] || config["MONGOLAB_URI"]

    URI.parse url
  end

  def local_mongo_uri
    url = ENV["MONGO_URL"] || "mongodb://localhost:27017/#{app}"

    URI.parse url
  end

  def config
    api.get_config_vars(app).body
  end
end
