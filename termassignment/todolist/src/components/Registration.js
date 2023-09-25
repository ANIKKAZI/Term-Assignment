import React, {useState,useEffect} from 'react'
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import './Reg.css'
import Logout from './Logout';
import AWS from 'aws-sdk';
const Registration = () => {
 let [firstName,setFirstName] = useState('');
 let [lastName,setLastName] = useState();
 let [email,setEmail] = useState();
 let [password,setPassword] = useState();
 let [confPassword,setConfPassword] = useState();
 let [regUrl,setRegUrl] = useState();
 let navigate = useNavigate();
 process.env.AWS_SDK_LOAD_CONFIG = '1';
useEffect(()=>{
  const apiGateway = new AWS.APIGateway({ apiVersion: '2015-07-09' });
  apiGateway.getRestApis({}, (err, response) => {
    if (err) {
      console.error('Error fetching API Gateway APIs:', err);
    } else {
      console.log(response);
      let endpointId = response.items.find((element)=>{
        return element.name === "reg-api"
      });
      console.log(endpointId);
      if(endpointId){
        setRegUrl('');
        let url = `https://${endpointId.id}.execute-api.us-east-1.amazonaws.com/dev/lambda`;
        console.log(url);
        setRegUrl(url);
      }
    }
  });
},[regUrl]);

 const completeRegistration = (event)=>{
      event.preventDefault();
      const uniqueId = uuidv4().substring(0,5);
      let regDetails = {
            userid: uniqueId,
            firstName: firstName,
            lastName: lastName,
            email:email,
            password:password
      }
    axios.post(regUrl,regDetails)
    .then((response) => {
     if(response.data === "success"){
        navigate("/login")
     }
    })
    .catch((error) => {
      console.log(error)
      
    })
  }
 const navigateToLogin = ()=>{
  console.log("Hello world");
  navigate('/login');
 }
  return (
   <React.Fragment>
    {/* <h1 className='start-name'>Set Me Up</h1> */}
   <Logout/>
       <div className="register-photo">
        <div className="form-container">
            <div className="image-holder"></div>
            <form onSubmit={completeRegistration}>
                <h2 className="text-center"><strong>Create</strong> an account.</h2>
                <div className="form-group">
                  <input className="form-control" 
                  type="text" 
                  name="firstname" 
                  placeholder="First Name"
                  value={firstName}
                  required
                  onChange={(event) => {
                    setFirstName(event.target.value);
                  }}/>
                </div>
                <div className="form-group">
                  <input className="form-control" 
                  type="text" 
                  name="lastname" 
                  placeholder="Last Name"
                  value={lastName}
                  required
                  onChange={(event) => {
                    setLastName(event.target.value);
                  }}/>
                </div>
                <div className="form-group">
                  <input className="form-control"
                   type="email" 
                   name="email" 
                   placeholder="Email"
                   value={email}
                   required
                   onChange={(event) => {
                    setEmail(event.target.value);
                  }}/>
                </div>
                <div className="form-group">
                  <input className="form-control" 
                  type="password" 
                  name="password" 
                  placeholder="Password"
                  value={password}
                  required
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}/>
                </div>
                <div className="form-group">
                  <input className="form-control" 
                  type="password" 
                  name="password-repeat" 
                  placeholder="Password (repeat)"
                  value={confPassword}
                  required
                  onChange={(event) => {
                    setConfPassword(event.target.value);
                  }}
                  />
                </div>
                {/* <div className="form-group">
                    <div className="form-check"><label className="form-check-label">
                      <input className="form-check-input" type="checkbox"/>I agree to the license terms.</label>
                    </div>
                </div> */}
                <div className="form-group">
                  <button className="btn btn-primary btn-block" type="submit">Sign Up</button>
                  </div>
                  <div className="already" onClick={navigateToLogin}>You already have an account? Login here.</div>
            </form>
        </div>
    </div>

   </React.Fragment>
  )
}
export default Registration