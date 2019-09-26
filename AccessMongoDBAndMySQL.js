/* @License Starts
 *
 * Copyright © 2015 - present. MongoExpUser
 *
 * License: MIT - See: https://github.com/MongoExpUser/Shale-Reservoir-DNN-and-Drilling-Rare-Events-Graph/blob/master/README.md
 *
 * @License Ends
 *
 *
 * ...Ecotert's AccessMongoDBAndMySQL.js (released as open-source under MIT License) implements:
 
 * A) AccessMongoDBAndMySQL() class to:
 *    i)  connect to and carry out CRUD operations & simple queries on MongoDB & MySQL (both regular SQL & NoSQL/Document Store)
 *    ii) upload/download  files
 *
 *    using:
 *
 *    (1) MongoDB native driver - https://www.npmjs.com/package/mongodb
 *    (2) MySQL Node.js driver - https://www.npmjs.com/package/mysql
  *   (3) MySQL Connector/Node.js - https://www.npmjs.com/package/@mysql/xdevapi
 *    (4) Node.js native file stream module and MongoDB GridFS
 *
 * B) TestAccessMongoDBAndMySQL() class: to test AccessMongoDBAndMySQL() class
 *
 */

class AccessMongoDBAndMySQL
{
    constructor()
    {
      return null;
    }
    
    static getCollectionNames(collectionsList)
    {
        var namesList = [];
                            
        for(let index in collectionsList)
        {
            for(let key in collectionsList[index])
            {
                if(key === "name")
                {
                    namesList.push(collectionsList[index]["name"]);
                }
            }
        }
        
        return namesList;
    }
    
    static collectionExist(collectionNamesList, collectionName)
    {
        for(let index in collectionNamesList)
        {
            if(collectionNamesList[index] === collectionName)
            {
                return true;
            }
        }
        
        return false;
    }
    
    static drillingEventTableSchema()
    {
        //define schema variable and bracket, with correct spaces & commas
        let schema = "";
        let closeBracket = ")";
        
        //define input keys
        let inputKeys = AccessMongoDBAndMySQL.drillingEventDocumentKeys();
        
        //define data types, with correct spaces and commas
        const doubleDataType = " DOUBLE, ";
        const textDataType = " TEXT, ";
        const booleanDataType = " BOOLEAN, ";
        const datatimeDataType = " DATETIME, ";
        
        //add "ROWID" primary key as auto increment (primary key is like automatically assigned "_id" in MongoDB)
        schema = " (ROWID INT AUTO_INCREMENT PRIMARY KEY, ";
        
        //then concatenate all keys, data types, spaces and commas
        for(let index = 0; index < inputKeys.length; index++)
        {
            if(index < 6)
            {
                schema = schema + inputKeys[index] + doubleDataType;
            }
            else if(index === 6)
            {
                schema = schema + inputKeys[index] + textDataType;
            }
            else if(index > 6  && index < 20)
            {
                schema = schema + inputKeys[index] + doubleDataType;
            }
            else if(index >= 20  && index < 23)
            {
                schema = schema + inputKeys[index] + booleanDataType;
            }
            else if(index === 23)
            {
                schema = schema + inputKeys[index] + datatimeDataType;
            }
        }
        
        //add constraints on some LWD data
        let constraints = "CHECK (0>=GR_api<=150), CHECK (0>=DEEP_RESISTIVITY_ohm_m<= 2000)";
        
        //finally concatenate all, including constraints and close bracket to get the "tableSchema"
        const tableSchema = schema + constraints + closeBracket;
        
        return tableSchema;
    }
    
    static drillingEventTableKeys()
    {
        //define key variable, opening brackets, closing brackets and seperators, with correct spaces & commas
        let keys = "";
        let seperator =  ", ";
        let openBracket = " ("
        let closeBracket = ")";
        
        //define input keys
        let inputKeys = AccessMongoDBAndMySQL.drillingEventDocumentKeys();
        
        //then concatenate opening bracket, all keys, spaces, commas and close bracket
        keys = keys + openBracket;
        
        for(let index = 0; index < inputKeys.length; index++)
        {
            if(index < (inputKeys.length-1))
            {
                keys = keys + inputKeys[index] + seperator;
            }
            else
            {
                keys = keys + inputKeys[index];
            }
        }
        
        keys = keys + closeBracket;
    
        return keys
    }

    static drillingEventTableValues()
    {
        //values below map directly, sequentially, to keys in drillingEventTableKeys()
        return AccessMongoDBAndMySQL.drillingEventDocumentValues();
    }
    
    static drillingEventDocumentKeys()
    {
        return [
                //data from regular drilling operation (drillstring-related)
                "ROP_fph",
                "RPM_rpm",
                "SPP_psi",
                "DWOB_lb",
                "SWOB_lb",
                "TQR_Ibft",
                "BHA_TYPE_no_unit",
                //data from regular drilling operation (mud-related)
                "MUD_WEIGHT_sg",
                "MUD_PLASTIC_VISC_cp",
                "MUD_YIELD_POINT_lb_per_100ft_sq",
                "MUD_FLOW_RATE_gpm",
                //data (measured or calculated) from downhole MWD/LWD tool measurements
                "TVD_ft",
                "MD_ft",
                "INC_deg",
                "AZIM_deg",
                "Dogleg_deg_per_100ft",
                "CALIPER_HOLE_SIZE_inches",
                "GR_api",
                "DEEP_RESISTIVITY_ohm_m",
                "SHOCK_g",
                //event data from MWD/LWD MWD/LWD tool measurements and other sources
                "IS_VIBRATION_boolean_0_or_1",
                "IS_KICK_boolean_0_or_1",
                "IS_STUCKPIPE_boolean_0_or_1",
                //time data
                "TIME_ymd_hms"
        ]
    }
    
    static drillingEventDocumentValues()
    {
        //values below map directly, sequentially, to keys in drillingEventDocumentKeys()
        return [    //data from regular drilling operation (drillstring-related)
                    35, 65, 235, 20000, 10000, 800, 'slick',
                    //data from regular drilling operation (mud-related)
                    1.18, 18.01, 16, 98.14,
                    //data (measured or calculated) from downhole MWD/LWD tool measurements
                    8000, 12000, 67.2, 110.5, 1.1, 6, 20, 303.3, 26,
                    //event data from MWD/LWD MWD/LWD tool measurements and other sources
                    0, 0, 0,
                    //time data
                    new Date()
        ];
    }
    
    static drillingEventDocumentKeyValuePairs(keys, values)
    {
        const keyValuePairs = {};
        const validKeyValuePairs = (keys !== null) && (keys !== undefined) && (values !== null) &&
                                   (values !== undefined) && (keys.length === values.length);
        
        if(validKeyValuePairs === true)
        {
            for(let index = 0; index < keys.length; index++)
            {
                keyValuePairs[keys[index]] = values[index];
            }
        }
        
        //add constraints on some LWD data
        // 1. GR_api constraint => 0>=GR_api<=150
        if((keyValuePairs[keys[17]]) < 0 || (keyValuePairs[keys[17]] > 150))
        {
          keyValuePairs[keys[17]] = NaN;
        }
        // 2. DEEP_RESISTIVITY_ohm_m constraint => 0>=DEEP_RESISTIVITY_ohm_m<= 2000
        if((keyValuePairs[keys[18]]) < 0 || (keyValuePairs[keys[18]] > 2000))
        {
          keyValuePairs[keys[18]] = NaN;
        }
        
        return keyValuePairs;
    }
    

    mongoDBConnectionOptions(sslCertOptions, enableSSL)
    {
        if(enableSSL === true)
        {
            return {useNewUrlParser: true, useUnifiedTopology: true, readPreference: 'primaryPreferred',
                    maxStalenessSeconds: 90, poolSize: 200, ssl: true, sslValidate: true,
                    sslCA: sslCertOptions.ca, sslKey: sslCertOptions.key, sslCert: sslCertOptions.cert
            };
        }
        else
        {
            return {useNewUrlParser: true, useUnifiedTopology: true, readPreference: 'primaryPreferred',
                    maxStalenessSeconds: 90, poolSize: 200, ssl: false, sslValidate: false
            };
        }
    }
    
    mySQLConnectionOptions(sslCertOptions, enableSSL, connectionOptions)
    {
        if(enableSSL === true)
        {
            return {host: connectionOptions.host, port: connectionOptions.port, user: connectionOptions.user,
                    password: connectionOptions.password, database: connectionOptions.database, debug: connectionOptions.debug,
                    timezone: 'Z', supportBigNumbers: true, ssl:{ca: sslCertOptions.ca, key: sslCertOptions.key, cert: sslCertOptions.cert},
                    pooling: { enabled: true, maxSize: 200 }
            };
        }
        else
        {
            return {host: connectionOptions.host, port: connectionOptions.port, user: connectionOptions.user,
                    password: connectionOptions.password, database: connectionOptions.database, debug: connectionOptions.debug,
                    timezone: 'Z', supportBigNumbers: true, ssl: enableSSL, pooling: { enabled: true, maxSize: 200 }
            };
            
        }
    }
    
    AccessMongoDB(dbUserName, dbUserPassword, dbDomainURL, dbName, collectionName, confirmDatabase, sslCertOptions,
                  createCollection=false, dropCollection=false, enableSSL=false, collectionDisplayOption=undefined)
    {
        //connect with "MongoDB Node.js Native Driver". See - https://www.npmjs.com/package/mongodb
        const mongodb = require('mongodb');
        const fs = require('fs');
        const uri = String('mongodb://' + dbUserName + ':' + dbUserPassword + '@' + dbDomainURL + '/' + dbName);
        const mda = new AccessMongoDBAndMySQL();
        const mongodbOptions = mda.mongoDBConnectionOptions(sslCertOptions, enableSSL);
        
        mongodb.MongoClient.connect(uri, mongodbOptions, function(connectionError, client)
        {
            // 0.connect (authenticate) to database with mongoDB native driver (client)
            if(connectionError)
            {
                console.log(connectionError);
                console.log("Connection error: MongoDB-server is down or refusing connection.");
                return;
            }
    
            console.log();
            console.log("Now connected to MongoDB Server on: ", dbDomainURL);
            console.log();
            const db = client.db(dbName);
            
            if(confirmDatabase === true && dbName !== null)
            {
                //1...... confirm collection(s) exit(s) within database
                db.listCollections().toArray(function(confirmCollectionError, existingCollections)
                {
                    if(confirmCollectionError)
                    {
                        console.log("confirm Collection Error: ", confirmCollectionError);
                        return;
                    }
                        
                    //2...... check if "collectionName" exists in collection(s)
                    const collectionNamesList = AccessMongoDBAndMySQL.getCollectionNames(existingCollections)
                        
                    if(existingCollections.length > 0)
                    {
                        console.log("Total number of COLLECTION(S) within", dbName, "database:", existingCollections.length);
                        console.log();
                        console.log("It is confirmed that the COLLECTION(S) below exist(s) within", dbName, "database:");
                        console.log(collectionNamesList);
                        console.log();
                    }


                    if(createCollection === true)
                    {
                        //3...... create collection (TABLE equivalent in MySQL), if desired
                        //note: "strict: true" ensures unique collectionName: this is like "CREATE TABLE IF NOT EXISTS tableName" in MySQL
                        db.createCollection(collectionName, {strict: true}, function(createCollectionError, createdCollection)
                        {
                            if(createCollectionError && createCollectionError.name === "MongoError")
                            {
                                console.log("Error: Existing COLLLECTION Error or other Error(s)");
                            }
                                
                            if(createdCollection)
                            {
                                console.log(collectionName, " COLLECTION successfully created!");
                                console.log();
                            }


                            //4a...... get document count for auto increment of "_docId" value
                            //use aggregate pipeline stage to obtain number of existing document in the collection
                            const pipeline = [ { $group: { _id: null, numberOfDocuments: { $sum: 1 } } }, { $project: { _id: 0 } } ];
    
                            db.collection(collectionName).aggregate(pipeline).toArray(function(numberOfDocumentsError, documentPipeline)
                            {
                                if(numberOfDocumentsError)
                                {
                                    console.log("Document Counts Error: ", numberOfDocumentsError);
                                    return;
                                }
                                      
                                            
                                //4b...... insert document and its key-value pairs  (i.e COLUMN & ROW-VALUES equivalent in MySQL) into collection
                                const keys = AccessMongoDBAndMySQL.drillingEventDocumentKeys();
                                const values = AccessMongoDBAndMySQL.drillingEventDocumentValues();
                                const documentObject = AccessMongoDBAndMySQL.drillingEventDocumentKeyValuePairs(keys, values);
                                        
                                //insert auto increased "_DocumentID" key and value in documentObject before inserting "document" into the collection
                                //auto increased "_DocumentID" value mimics or is equivalent to "ROWID" in MySQL
                                const key = "_DocumentID";
                                let value = undefined;
                                
                                if(documentPipeline[0] === undefined)
                                {
                                    //for collection with no document
                                    value = 1;
                                    documentObject[key] = value;
                                }
                                else
                                {
                                    //for collection with at least one document, auto increase by 1
                                    value  =  documentPipeline[0].numberOfDocuments + 1;
                                    documentObject[key] = value;
                                }
                                        
                                
                                db.collection(collectionName).insertOne(documentObject, function(insertCollectError, insertedObject)
                                {
                                    if(insertCollectError)
                                    {
                                        console.log("Insert Collection Error: ", insertCollectError);
                                        return;
                                    }
                                                    
                                    console.log("Document with id (",documentObject._id,") and its field values are inserted into " + String(collectionName) + " COLLECTION successfully!");
                                    console.log();
                                        
                                        
                                    //5...... show records
                                    // note a: if "collectionDisplayOption" is null or undefined or unspecified, all documents & their
                                    //         key-value pairs in the COLLECTION will be displayed based on MongoDB default ordering
                                    // note b: empty {} documentNames signifies all document names in the collection
                                    if(collectionDisplayOption === "all" || collectionDisplayOption === null || collectionDisplayOption === undefined)
                                    {
                                        //option a: show all documents & their key-value pairs in the COLLECTION (sorted by dateTime in ascending order)
                                        var sortByKeys = {_DocumentID: 1};
                                        var specifiedKeys = {};
                                        var documentNames = {};
                                    }
                                    else if(collectionDisplayOption === "wellTrajectory")
                                    {
                                        //option b: show all documents & key-value pairs, based on specified key, in the COLLECTION (sorted by _DocumentID in ascending order)
                                        //note: specified keys (except _id, _DocumentID, and TIME_ymd_hms) are related to "well trajectory"
                                        var sortByKeys = {_DocumentID: 1};
                                        var specifiedKeys =  {_id: 1, _DocumentID: 1, MD_ft: 1, TVD_ft: 1, INC_deg: 1, AZIM_deg: 1, Dogleg_deg_per_100ft: 1, TIME_ymd_hms: 1};
                                        var documentNames = {};
                                    }
                                            
                                    db.collection(collectionName).find(documentNames, {projection: specifiedKeys}).sort(sortByKeys).toArray(function(showCollectionError, foundCollection)
                                    {
                                        if(showCollectionError)
                                        {
                                            console.log("Show COLLECTION Error: ", showCollectionError);
                                            return;
                                        }
                                            
                                        console.log("Some or all documents and their field values in " + String(collectionName) + " COLLECTION are shown below!");
                                        console.log(foundCollection);
                                        console.log();
                                    
                  
                                        //6...... drop/delete collection, if desired - using Async IIFE
                                        if(dropCollection === true)
                                        {
                                            db.collection(collectionName).drop(function(dropCollectionError, droppedCollectionConfirmation)
                                            {
                                                if(dropCollectionError)
                                                {
                                                    console.log("Drop/Delete COLLECTION Error: ", dropCollectionError);
                                                    return;
                                                }
                                                            
                                                console.log(String(collectionName) + " COLLECTION is successfully dropped/deleted!");
                                                console.log("Dropped?: ", droppedCollectionConfirmation);
                                                console.log();
                                            });
                                        }
                                        
                                        //finally close client (i.e. disconnect) from MongoDB server
                                        client.close();
                                    });
                                });
                            });
                        });
                    }
                });
            }
        });
    }
    
    AccessMySQL(sslCertOptions, connectionOptions, tableName, confirmDatabase=false,
                createTable=false, dropTable=false, enableSSL=false, tableDisplayOption=undefined)
    {
        //connect with "MySQL Node.js Driver". See - https://www.npmjs.com/package/mysql
        const mysql = require('mysql');
        const fs = require('fs');
        const mda = new AccessMongoDBAndMySQL();
        const mysqlOptions = mda.mySQLConnectionOptions(sslCertOptions, enableSSL, connectionOptions);
        const dbName = String(connectionOptions.database);
        
        //0. connect (authenticate) to database with msql node.js driver (client)
        const client = mysql.createConnection(mysqlOptions);
        console.log();
        console.log("Connecting......");
           
        client.connect(function(connectionError)
        {
            if(connectionError)
            {
                console.log("Connection Error: ", connectionError);
                return;
            }
                        
            console.log("Now connected to MySql server on: ", connectionOptions.host);
            console.log();
            
            if(confirmDatabase === true && dbName !== null)
            {
                //1. confirm table(s) exit(s) within database
                var mySqlQuery = "SHOW TABLES"
                    
                client.query(mySqlQuery, function (confirmTableError, result)
                {
                    if(confirmTableError)
                    {
                        console.log("Confirm TABLE Error: ", confirmTableError);
                        return;
                    }
                          
                    if(result)
                    {
                        console.log("It is confirmed that the TABLE(S) below exist(s) within ", dbName, " database");
                        console.log(result);
                        console.log();
                    }
         
                    if(createTable === true)
                    {
                        //2. create a new table, if desired
                        const mda = AccessMongoDBAndMySQL;
                        const tableSchema =  mda.drillingEventTableSchema();
                        var mySqlQuery = "CREATE TABLE IF NOT EXISTS " + String(tableName) + tableSchema;
                            
                        client.query(mySqlQuery, function (createTableError, result)
                        {
                            if(createTableError)
                            {
                                console.log("Create TABLE Error: ", createTableError);
                                return;
                            }
                                
                            if(result)
                            {
                                console.log(String(tableName) + " TABLE successfully created!");
                                console.log();
                            }
              
                            //3. insert column values
                            var keys = AccessMongoDBAndMySQL.drillingEventTableKeys();
                            //note: "values" is an Array/List containing values of data types: double, text/string, boolean & datetime/date
                            var values = AccessMongoDBAndMySQL.drillingEventTableValues();
                            var mySqlQuery = "INSERT INTO " + String(tableName) + keys + " VALUES (?, ?, ?, ?,"
                                             + "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                                
                            client.query(mySqlQuery, values, function (insertTableError, result)
                            {
                                if(insertTableError)
                                {
                                    console.log("Insert TABLE Error: ", insertTableError);
                                    return;
                                }
                                    
                                console.log("Column values are inserted into " + String(tableName) + " TABLE successfully!");
                                console.log();
                     
          
                                //4. show rows and column values in the TABLE
                                if(tableDisplayOption === "all" || tableDisplayOption === null || tableDisplayOption === undefined)
                                {
                                    //a. all rows and columns
                                    var mySqlQuery = "SELECT * FROM " + String(dbName) + "." + String(tableName);
                                    var rowID = {}; //implies all rows
                                }
                                else if(tableDisplayOption === "wellTrajectoryAllRows")
                                {
                                    //b. all rows and and columns values related to "well trajectory" and "TIME"
                                    var someColumns = "MD_ft, TVD_ft, INC_deg, AZIM_deg, TIME_ymd_hms";
                                    var mySqlQuery = "SELECT " + someColumns + " FROM " + String(dbName) + "." + String(tableName);
                                    var rowID = {}; //implies all rows
                                }
                                else if(tableDisplayOption === "wellTrajectoryOneRow")
                                {
                                    //c. one row and and columns values related to "well trajectory" and "TIME"
                                    var someColumns = "MD_ft, TVD_ft, INC_deg, AZIM_deg, TIME_ymd_hms";
                                    var mySqlQuery = "SELECT " + someColumns + " FROM " + String(dbName) + "." + String(tableName) + " WHERE ROWID=?";
                                    var rowID = 1;
                                }
                                else
                                {
                                    //default: same as all
                                    var mySqlQuery = "SELECT * FROM " + String(dbName) + "." + String(tableName);
                                    var rowID = {}; //implies all rows
                                }

                                client.query(mySqlQuery, [rowID], function (showTableError, result)
                                {
                                    if(showTableError)
                                    {
                                        console.log("Show TABLE Error: ", showTableError);
                                        return;
                                    }
                                    
                                    console.log("Some or all rows and column values in " + String(tableName) + " TABLE are shown below!");
                                    console.log(result);
                                    console.log();
                         
                                    //5. drop/delete table, if desired - using Async IIFE
                                    if(dropTable === true)
                                    {
                                        var mySqlQuery = "DROP TABLE IF EXISTS " + String(tableName);
                                            
                                        client.query(mySqlQuery, function (dropTableError, result)
                                        {
                                            if(dropTableError)
                                            {
                                                console.log("Drop/Delete TABLE Error: ", dropTableError);
                                                return;
                                            }
                                            
                                            console.log(String(tableName) + " TABLE is successfully dropped/deleted!")
                                            console.log();
                                        });
                                    }

                                    //finally close client (i.e. disconnect) from MySQL server
                                    client.end();
                                });
                            });
                        });
                    }
                });
            }
        });
    }
    
    AccessMySQLDocumentStore(sslCertOptions, connectionOptions, tableName, confirmDatabase=false,
                             createTable=false, dropTable=false, enableSSL=false, tableDisplayOption=undefined)
    {
        //In progress ......
        //connect with "MySQL Connector/Node.js". See - https://www.npmjs.com/package/@mysql/xdevapi
        const mysqlx = require('@mysql/xdevapi');
        const fs = require('fs');
        const mda = new AccessMongoDBAndMySQL();
        const mysqlxOptions = mda.mySQLConnectionOptions(sslCertOptions, enableSSL, connectionOptions);
        const dbName = String(connectionOptions.database);
        
        //map mysql variables to no-mysql (document store) variables
        const collectionName = tableName;
        const createCollection = createTable;
        const dropCollection = dropTable;
        const collectionDisplayOption = tableDisplayOption;
        
        //change port to mysqlx default port of '33060' before passing "options" to connecting session
        mysqlxOptions.port = '33060';
        
        //0. connect (authenticate) to database with mysql connector/ node.js (client) - i.e. mysqlx
        const session = mysqlx.getSession(mysqlxOptions);
        console.log();
        console.log("Connecting......");
        
        session.then(function(client)
        {
            console.log();
            console.log("Now connected to MySqlx server on:", connectionOptions.host);
            console.log();
            const db = client.getSchema(dbName);
            
            //finally close client (i.e. disconnect) from MySQL server session
            client.close();
                
        }).catch(function(connectionError)
        {
            if(connectionError)
            {
                console.log("Connection Error: ", connectionError);
                return;
            }
        });
        
        //In progress ...... add CRUD operations and other queries later
    }
    
    mongoDBGridFSUploadDownloadFiles(dbUserName, dbUserPassword, dbDomainURL, dbName, sslCertOptions,
                                     collectionName, enableSSL, inputFilePath, outputFileName, action)
    {
        const fs = require('fs');
        const assert = require('assert');
        const mongodb = require('mongodb');
        const uri = String('mongodb://' + dbUserName + ':' + dbUserPassword + '@' + dbDomainURL + '/' + dbName);
        const mda = new AccessMongoDBAndMySQL();
        const mongodbOptions = mda.mongoDBConnectionOptions(sslCertOptions, enableSSL);
        
        mongodb.MongoClient.connect(uri, mongodbOptions, function(connectionError, client)
        {
            if(connectionError)
            {
                console.log(connectionError);
                console.log("Connection error: MongoDB-server is down or refusing connection.");
                return;
            }
            
            const db = client.db(dbName);
            
            const bucket  = new mongodb.GridFSBucket(db, {bucketName: collectionName, chunkSizeBytes: 1024});
                   
            if(action === "upload")
            {
                const upload = fs.createReadStream(inputFilePath, {'bufferSize': 1024}).pipe(bucket.openUploadStream(outputFileName));
                    
                upload.on('error', function(error)
                {
                    assert.ifError(error);
                   
                });
                    
                upload.on('finish', function()
                {
                    console.log('Done uploading' + inputFilePath + '!');
                    client.close();
                    process.exit(0);
                });
            }
                    
            if(action === "download")
            {
                const download = bucket.openDownloadStreamByName(inputFilePath).pipe(fs.createWriteStream(outputFileName), {'bufferSize': 1024});
                    
                download.on('error', function(error)
                {
                    assert.ifError(error);
                });
                    
                download.on('finish', function()
                {
                    console.log('Done downloading ' + outputFileName + '!');
                    client.close();
                    process.exit(0);
                });
            }
        });
    }
}


class TestAccessMongoDBAndMySQL
{
    constructor(test=true, dbType=undefined)
    {
        const fs = require('fs');
        const mda = new TestAccessMongoDBAndMySQL();
            
        if(test === true && dbType === 'MongoDB')
        {
          const dbUserName = "dbUserName";
          const dbUserPassword = "dbUserPassword";
          const dbDomainURL = "db.domain.com";
          const dbName = "dbName";
          const collectionName = "Drilling_Events";
          const confirmDatabase = true;
          const sslCertOptions = {
            ca: fs.readFileSync('/path_to_/ca.pem'),
            key: fs.readFileSync('//path_to_/key.pem'),
            cert: fs.readFileSync('//path_to_/cert.pem')
          };
          const createCollection = true;
          const dropCollection = true;
          const enableSSL = false;
          const collectionDisplayOption = "all"; //or "wellTrajectory"
          mda.AccessMongoDB(dbUserName, dbUserPassword, dbDomainURL, dbName, collectionName, confirmDatabase,
                            sslCertOptions, createCollection, dropCollection, enableSSL, collectionDisplayOption);
        }
        
        if(test === true && (dbType === 'MySql' || dbType === 'MySqlx'))
        {
          const sslCertOptions = {
            ca: fs.readFileSync('/path_to_/ca.pem'),
            key: fs.readFileSync('/path_to_/client-key.pem'),
            cert: fs.readFileSync('/path_to_/client-cert.pem'),
          };
          const connectionOptions = {
            host: 'host',
            port: 'port',
            user: 'user',
            password: 'password',
            database: 'databaseName',
            debug: false,
            ssl: {ca: sslCertOptions.ca, key: sslCertOptions.key, cert: sslCertOptions.cert}
          };
          const tableName = "Drilling_Events"
          const confirmDatabase = true;
          const createTable = true;
          const dropTable = true;
          const enableSSL = false;
          const tableDisplayOption = "all"; // or "wellTrajectoryOne" or "wellTrajectoryAll"
          if(dbType == 'MySql')
          {
            mda.AccessMySQL(sslCertOptions, connectionOptions, tableName, confirmDatabase, createTable, dropTable, enableSSL, tableDisplayOption);
          }
          else if(dbType == 'MySqlx')
          {
              mda.AccessMySQLDocumentStore(sslCertOptions, connectionOptions, tableName, confirmDatabase, createTable, dropTable, enableSSL, tableDisplayOption);
          }
        }
    }
}

module.exports = {AccessMongoDBAndMySQL, TestAccessMongoDBAndMySQL};
