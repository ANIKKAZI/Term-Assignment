const AWS = require('aws-sdk');
const mysql = require('mysql');

exports.handler = async (event, context) => {
    // RDS MySQL configuration
    let client = new AWS.SecretsManager();
    let sns = new AWS.SNS();
    let rds = new AWS.RDS();
    let secretName = "to-do-secret-cfn";
    let secretValue = "";
    let endpoint = "";
    let email = "aniketh2k24@gmail.com";
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
  let activityId = requestBody.activityId;
  let activityName = requestBody.activityName;
  let userid = requestBody.userid;
  let activityDate = requestBody.activityDate;
  let activitiyStatus =  requestBody.activitiyStatus;
  // Create a MySQL connection
  const connection = mysql.createConnection(dbConfig);

  // Connect to the database
  connection.connect();

  try {
    // Execute a query
    const query = `INSERT INTO Activity (activityId, activityName, userid, activityDate, activitiyStatus) VALUES ('${activityId}', '${activityName}', '${userid}','${activityDate}',${activitiyStatus})`;
    
    const results = await executeQuery(connection, query);

    console.log(results);
    let snsTopicArn = await getTopic(sns);
      console.log("this is the topic arn",snsTopicArn);

     const snsMsg = {
        Message: `You have added an acitivity ${activityName} which is due on ${activityDate}`,
        Subject: 'To-Do Creation Success',
        TopicArn: `${snsTopicArn}`
      };
      try {
        //const result = await sns.publish(snsMsg).promise();
         const result = await publishMessage(sns,snsMsg);
         console.log('Message published successfully:', result);
         return result;
      } catch (error) {
        console.error('Failed to publish message:', error);
        throw error;
      }
  } catch (error) {
    console.error("Error executing query:", error);
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

function publishMessage(sns,snsMsg) {
  console.log("inside the publish message",snsMsg);
  return new Promise((resolve, reject) => {
    sns.publish(snsMsg, (err, data) => {
      if (err) {
        console.error('Error sending SNS message:', err);
        reject(err);
      } else {
        console.log('SNS message sent:', data.MessageId);
        resolve(data);
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


