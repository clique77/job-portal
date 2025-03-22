import Registration from './сomponents/Registration/Registration';
import JobList from './сomponents/Jobs/JobList/JobList';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './сomponents/NavBar/NavBar';
function App() {

  return (
    <Router>
     <div className='navigation'>
      <NavBar/>
     </div>
      <div className='App'>
        <Routes>
          <Route path='/' element={<JobList/>} />
          <Route path='/registration' element={<Registration/>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
