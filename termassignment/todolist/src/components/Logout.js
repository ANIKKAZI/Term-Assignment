import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom';
import './Logout.css'
const Logout = () => {
  let navigate = useNavigate();
  const [isUserSignedIn,setUserSignedIn] = useState(sessionStorage.getItem('userid')? true:false)
  let logout = ()=>{
    sessionStorage.removeItem('userid');
    navigate('/login')
  }
  return (
    <>
       <div className='start-name'>
        Set Me Up
       { isUserSignedIn &&
           <button className= 'btn btn-primary-logout btn-block logout-btn' onClick={logout}>Logout</button>
       }
      </div>
    </>
    
  )
}

export default Logout