import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Home from './pages/HomePage.jsx';
import Signup from './pages/SignUpPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import './App.css'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/dashboard' element = {<Dashboard/ >} />
      </Routes>
  </Router>
  )
}

export default App
