const AWS = require('aws-sdk');
const mysql = require('mysql');

exports.handler = async (event, context) => {
    // RDS MySQL configuration
    let client = new AWS.SecretsManager();
    let rds = new AWS.RDS();
    let secretName = "to-do-secret-cfn";
    let secretValue = "";
    let endpoint = "";
    try{
      let describeParams = {
        DBInstanceIdentifier: 'mycustomdbinstanceidentifier',
      };
      let response = await client.getSecretValue({ SecretId: secretName }).promise();
      secretValue = JSON.parse(response.SecretString);
      let data = await rds.describeDBInstances(describeParams).promise()
      endpoint = data.DBInstances[0].Endpoint.Address;
    }
    catch(err){
      console.log(err);
    }
  const dbConfig = {
    host: endpoint,
    user: secretValue.username,
    password: secretValue.password,
    database: 'ToDo'
  };
  let requestBody = JSON.parse(event.body);
  let email = requestBody.email;
  // Create a MySQL connection
  const connection = mysql.createConnection(dbConfig);
  const response = {
    statusCode: '',
    headers:{
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    },
    body: JSON.stringify("success")
}
  // Connect to the database
  connection.connect();

  try {
    // Execute a query
    const query = `Select userid from Users where email="${email}"`;
    const results = await executeQuery(connection, query);
    if(results.length >0)
    {
      //console.log(results[0].userid);
      if(results[0].userid)
      {
        //console.log(results[0].userid);
        let userid = results[0].userid;
        if(userid)
        {
          console.log(userid);
          const query = `Select * from Activity where userid="${userid}"`;
          const resultDisplay = await executeQuery(connection, query);
          if(resultDisplay)
          {
            console.log(resultDisplay);

            response.statusCode = '200';
            response.body =  JSON.stringify({userid:userid, activityList: resultDisplay});
          }
        }
        else{
          response.statusCode = '200';
          response.body =  JSON.stringify("error");
        }
      }
      else{
        response.statusCode = '200';
        response.body =  JSON.stringify("error");
      }
 
    }
    else{
      response.statusCode = '200';
      response.body =  JSON.stringify("error");
    }

   // console.log(results);
    // ...

   // return results;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  } finally {
    // Close the database connection
    connection.end();
    return response;
  }
  

  

};

// Helper function to execute a query and return a promise
function executeQuery(connection, query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}
