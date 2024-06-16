var promise = require('promise');
var mongoClient = require('mongodb').MongoClient;

var state =
{
    db : null
}
module.exports =
{
    Database_Connection : ()=>
    {
        return new promise((resolve,reject)=>
        {
            mongoClient.connect('mongodb://localhost:27017',{ useNewUrlParser: true, useUnifiedTopology: true },(err,data)=>
            {
                var dbname = "Ticket_Validation"
                if(err)
                {
                    reject(err)
                }
                else
                {
                    state.db = data.db(dbname);
                    resolve("Databse Connection Successfull...")
                }
            })
        })
    },
    get : ()=>
        {
            return state.db;
        }
}

