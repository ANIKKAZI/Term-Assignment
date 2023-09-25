const AWS = require('aws-sdk');
const mysql = require('mysql');

exports.handler = async (event, context) => {
  
  // RDS MySQL configuration
    // RDS MySQL configuration
    let client = new AWS.SecretsManager();
    let sns = new AWS.SNS();
    let rds = new AWS.RDS();
    let secretName = "to-do-secret-cfn";
    let secretValue = ""
    let userName="";
    let userPass="";
    let endpoint = "";
    try{
      let describeParams = {
        DBInstanceIdentifier: 'mycustomdbinstanceidentifier',
      };
      let response = await client.getSecretValue({ SecretId: secretName }).promise();
     // console.log("this is secret",response);
      secretValue = JSON.parse(response.SecretString);
      let data = await rds.describeDBInstances(describeParams).promise()
      endpoint = data.DBInstances[0].Endpoint.Address;
      userName = secretValue.username;
      userPass = secretValue.password;
    }
    catch(err){
     // console.log(err);
    }
  const dbConfig = {
    host: endpoint,
    user: userName,
    password: userPass,
    database: 'ToDo'
  };
  let requestBody = JSON.parse(event.body);
  let userid = requestBody.userid;
  let firstName = requestBody.firstName;
  let lastName = requestBody.lastName;
  let email = requestBody.email;
  let password =  requestBody.password;

 
    
  // Create a MySQL connection
  const connection = mysql.createConnection(dbConfig);

  // Connect to the database
  connection.connect();

  try {
    // Execute a query
    const query = `INSERT INTO Users (userid,name, email,password) VALUES ('${userid}', '${firstName}', '${email}','${password}')`;
    const createUserTableQuery = `CREATE TABLE Users (userid varchar(10) , name varchar(100),email varchar(100),password varchar(100), PRIMARY KEY (userid));`
    const createActivityTableQuery= `CREATE TABLE Activity (activityId varchar(10),activityName varchar(500),userid varchar(10),activityDate date NOT NuLl,activitiyStatus boolean NOT NuLl, primary key (activityId),FOREIGN KEY (userid) REFERENCES ToDo.Users(userid));`
    const userTableCreate = await executeUserCreateQuery(connection,createUserTableQuery) 
    //console.log(userTableCreate);
    const activityTableCreate = await executeActivityCreateQuery(connection,createActivityTableQuery);
   // console.log(activityTableCreate);
   // console.log
    const results = await executeQuery(connection, query);
    //console.log(results);
  
    let snsTopicArn = await getTopic(sns);
    console.log("this is the topic arn",snsTopicArn);
    // ...
  //logic for sns
    let params = {
      Protocol: 'email',
      TopicArn: snsTopicArn,
      Endpoint: email
    }
    try {
      const result = await sns.subscribe(params).promise();
     // console.log('SNS subscription created successfully:', result.SubscriptionArn);
      return result.SubscriptionArn;
    } catch (error) {
      //console.error('Failed to create SNS subscription:', error);
      throw error;
    }

    return results;
  } catch (error) {
    //console.error("Error executing query:", error);
    throw error;
  } finally {
    // Close the database connection
    connection.end();
    const response = {
      statusCode: 200,
      headers:{
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify("success"),
  };
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

function executeUserCreateQuery(connection, query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        resolve(error);
      } else {
        resolve(results);
      }
    });
  });
}
function executeActivityCreateQuery(connection, query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        resolve(error);
      } else {
        resolve(results);
      }
    });
  });
}
function getTopic(sns) {
  return new Promise((resolve, reject) => {
    const topicName = 'ToDoTopic';
    sns.listTopics({}, (err, data) => {
      if (err) {
        reject(err);
     } else {
      let topicArn = data.Topics.find((topic) => topic.TopicArn.endsWith(`:${topicName}`));
  
      if (topicArn) {
       resolve(topicArn.TopicArn)
      } else {
        reject(null);
      }
    }
  });
  });
}

