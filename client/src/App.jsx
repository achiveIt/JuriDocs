import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Home from './pages/HomePage.jsx';
import Signup from './pages/SignUpPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PdfViewer from './pages/PdfViewer.jsx'; 
import './App.css'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/dashboard' element = {<Dashboard/ >} />
        <Route path="/pdf/:id" element={<PdfViewer />} />
      </Routes>
  </Router>
  )
}

export default App
