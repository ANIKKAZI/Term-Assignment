const AWS = require('aws-sdk');
const mysql = require('mysql');

exports.handler = async (event, context) => {
    // RDS MySQL configuration
    let client = new AWS.SecretsManager();
    let rds = new AWS.RDS();
    let secretName = "to-do-secret-cfn";
    let secretValue = ""
    let endpoint = "";
    try{
      let response = await client.getSecretValue({ SecretId: secretName }).promise();
      secretValue = JSON.parse(response.SecretString);
      let describeParams = {
        DBInstanceIdentifier: 'mycustomdbinstanceidentifier',
      };
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
  let activityId = requestBody.activityId;
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
    const query = `Delete from Activity where activityId="${activityId}"`;
    const results = await executeQuery(connection, query);
    response.statusCode = '200';
    response.body =  JSON.stringify("success");
  } catch (error) {
    console.error("Error executing query:", error);
    response.statusCode = '200';
    response.body =  JSON.stringify("error");
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
