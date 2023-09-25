import React, {useEffect, useState} from 'react'
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';
import {v4 as uuid} from 'uuid';
import './Start.css'
import Logout from './Logout';
import AWS from 'aws-sdk';
const Start = () => {
    let [item,setItem] = useState('');
    let [date,setDate] = useState();
    let [userid,setUserId] = useState('');
    let [activityList,setActivityList] = useState([]);
    let [activityDetails,setActivityDetails]  = useState({});
    let [deleteActivity,setDeleteActivity] = useState(false);
    let [displayUrl,setDisplayUrl] = useState();
    let [allApi,setAllApi] = useState([]);
    let [addUrl,setAddUrl] = useState();
    let [deleteUrl,setDeleteUrl] = useState();
    process.env.AWS_SDK_LOAD_CONFIG = '1';
    //let today = Date.
     useEffect(() => {
       let email = sessionStorage.getItem("email");
       setUserId(sessionStorage.getItem("userid"));

       if(email && userid){
         let displayUser = {
           email: email
         }
         const apiGateway = new AWS.APIGateway({ apiVersion: '2015-07-09' });
         apiGateway.getRestApis({}, (err, response) => {
           if (err) {
             console.error('Error fetching API Gateway APIs:', err);
           } else {
             console.log(response);
             setAllApi(response.items)
             let endpointId = response.items.find((element)=>{
               return element.name === "display-api"
             });
             console.log(endpointId);
             if(endpointId){
               setDisplayUrl('');
               let url = `https://${endpointId.id}.execute-api.us-east-1.amazonaws.com/dev/lambda`;
               console.log(url);
               setDisplayUrl(url);
               axios.post(displayUrl,displayUser)
               .then((response) => {
                console.log(response);
                if(response.data && response.data.activityList) {
                   setActivityList(response.data.activityList);
                   setUserId(response.data.userid)
                }
               })
               .catch((error) => {
                 console.log(error)
               })
             }
           }
         });
       }
      
     }, [activityDetails, userid, deleteActivity, displayUrl]);
     
   
   
     const addList = (event)=>{
         event.preventDefault();
         let addDetails = {
             activityId: uuid().slice(0,4),
             activityName: item,
             userid: sessionStorage.getItem("userid"),
             activityDate: date,
             activitiyStatus: false
            }
       
        let addApiUrl = allApi.find((element)=>{
          return element.name === 'add-api';
        });
        if(addApiUrl){
          setAddUrl('');
          let url = `https://${addApiUrl.id}.execute-api.us-east-1.amazonaws.com/dev/lambda`;
          console.log(url);
          setAddUrl(url);
        }
       axios.post(addUrl,addDetails)
       .then((response) => {
        //console.log(response)
        if(response.data && response.data === "success"){
           setActivityDetails(addDetails);
           setItem("");
           setDate(null);
        }
       })
       .catch((error) => {
         console.log(error)
         
       })
     }
     const removeActivity = (activity)=>{
      setDeleteActivity(false);
      let deleteApiUrl = allApi.find((element)=>{
        return element.name === 'delete-api';
      }) ;
      if(deleteApiUrl){
        setDeleteUrl('');
        let url = `https://${deleteApiUrl.id}.execute-api.us-east-1.amazonaws.com/dev/lambda`;
        console.log(url);
        setDeleteUrl(url);
      } 
      axios.post(deleteUrl,activity)
      .then((response) => {
       //console.log(response)
       if(response.data && response.data === "success"){
          setDeleteActivity(true);
          setActivityDetails("");
          setItem("");
          setDate(null);
       }
      })
      .catch((error) => {
        console.log(error)
        
      })

     }
     return (
      <React.Fragment>
      <Logout></Logout>
         <div className='flexbox-container'>
            <div className='flexbox-item flexbox-item-1'>
                <div className='flexbox-child-container-1'>
                    <div className='flexbox-child-item-1'>
                         <Form className='form-container-start' 
                         onSubmit={addList} >
                            <div className="form-row">
                            <Form.Group className="form-group-start" controlId="todo-item">
                                <Form.Label className="form-label-start">Activity Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={item}
                                    required
                                    className='form-control-start'
                                    onChange={(event) => {
                                    setItem(event.target.value);
                                    }}
                                    />
                                </Form.Group>

                            </div>
                               
                                <div className="form-row">
                                <Form.Group className="form-group-start"controlId="date">
                                <Form.Label className='form-label-start'>Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={date}
                                    min="2018-01-01"
                                    required
                                    className='form-control-start'
                                    onChange={(event) => {
                                    setDate(event.target.value);
                                    }}
                                />
                                </Form.Group> 
                                </div>        
                                <Button  className ='add-activity'type="submit">
                                Submit
                                </Button>
                        </Form>
                    </div>
                </div>
             

            </div>
            <div className='flexbox-item flexbox-item-2'>
            <div className='flexbox-child-container-2'>
                                <ul>
                              {
                                    
                                    activityList.map((activity)=>{
                                    return(
                                        <div className='flexbox-child-item-2'>
                                             <li key={activity.userid}>
                                             <div>
                                                <p>
                                                  <strong>Activity Title</strong>
                                                  <p>
                                                  {activity.activityName}
                                                  </p>
                                                  
                                                </p>
                                                  
                                                <p>
                                                  <strong>Activity Due Date</strong>
                                                  <p>{activity.activityDate}
                                                  <button onClick={()=>{removeActivity(activity)}} className='remove-activity'>Remove Activity</button></p>
                                                </p>
                                            </div>
                                    </li>
                                        </div>
                                   
                                    )
                                    }) 
                              }
                            </ul>
                </div>
            </div>
         </div>
   
      </React.Fragment>
     )
}

export default Start