import Registration from './сomponents/Registration/Registration';
import JobList from './сomponents/Jobs/JobList/JobList';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './сomponents/NavBar/NavBar';
import Authentication from './сomponents/Authentication/Authentication';

function App() {
  return (
    <Router>
     <div className='navigation'>
      <NavBar/> 
     </div>
      <div className='App'>
        <Routes>
          <Route path='/' element={<JobList/>} >
            <Route path='/jobs/:jobId' element={<JobList/>} />
          </Route>
          <Route path='/registration' element={<Registration/>} />
          <Route path='/login' element={<Authentication/>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
