import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Routes,Route} from 'react-router-dom'
import Registration from './components/Registration';
import Login from './components/Login';
import Start from './components/Start';
function App() {
  return (
   <>
   <>
   <Router>
      <Routes>
        <Route path='/registration' element={<Registration/>}></Route>
        <Route path='/' element={<Registration/>}></Route>
        <Route path='*' element={<Registration/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/start' element={<Start/>}></Route>
      </Routes>
   </Router>
     
   </>
   </>
  );
}

export default App;
