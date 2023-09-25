import React, {useState,useEffect} from 'react'
import axios from 'axios';
import AWS from 'aws-sdk';
import { useNavigate } from 'react-router-dom';
import './Reg.css'
import Logout from './Logout';
const Login = () => {
   // let [apiUrl,setApiUrl] = useState('');
    let [password,setPassword] = useState();
    let [email,setEmail] = useState();
    let [loginUrl,setLoginUrl] = useState();
    process.env.AWS_SDK_LOAD_CONFIG = '1';
    let navigate = useNavigate();
    useEffect(()=>{
      const apiGateway = new AWS.APIGateway({ apiVersion: '2015-07-09' });
      apiGateway.getRestApis({}, (err, response) => {
        if (err) {
          console.error('Error fetching API Gateway APIs:', err);
        } else {
          console.log(response);
          let endpointId = response.items.find((element)=>{
            return element.name === "login-api"
          });
          console.log(endpointId);
          if(endpointId){
            setLoginUrl('');
            let url = `https://${endpointId.id}.execute-api.us-east-1.amazonaws.com/dev/lambda`;
            console.log(url);
            setLoginUrl(url);
          }
        }
      });
    },[loginUrl]);
    const completeLogin = (event)=>{
        event.preventDefault();
        let loginDetails = {
              email:email,
              password:password
        }
      axios.post(loginUrl,loginDetails)
      .then((response) => {
       if(response.data.message === "success")
       {
            sessionStorage.setItem("email",email);
            sessionStorage.setItem("userid",response.data.userid);
            navigate("/start")
       }
       else{
        console.log("Incorrect Details")
       }
      })
      .catch((error) => {
        console.log(error)
        
      })
    } 
    const navigateToReg = ()=>{
      console.log("Hello world");
      navigate('/registration');
     }

    return (
        <React.Fragment>
       <Logout/>
        <div className="register-photo">
        <div className="form-container">
            <div className="image-holder-2"></div>
            <form onSubmit={completeLogin}>
                <h2 className="text-center"><strong>Sign Up</strong> an account.</h2>
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
                {/* <div className="form-group">
                    <div className="form-check"><label className="form-check-label">
                      <input className="form-check-input" type="checkbox"/>I agree to the license terms.</label>
                    </div>
                </div> */}
                <div className="form-group">
                  <button className="btn btn-primary btn-block" type="submit">Sign In</button>
                  </div>
                  <div className="already" onClick={navigateToReg}>Do not have an account? Sign Up here.</div>
            </form>
        </div>
    </div>

       </React.Fragment>
    
  )
}

export default Login