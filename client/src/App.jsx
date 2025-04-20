import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Home from './pages/HomePage.jsx';
import Signup from './pages/SignUpPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PdfViewer from './pages/PdfViewer.jsx'; 
import SharedPDFView from './pages/InvitedPdf.jsx';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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
        <Route path="/shared/:shareLink" element={<PdfViewer />} />
        <Route path='shared/invite/:shareLink' element= {<SharedPDFView/>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
  </Router>
  )
}

export default App
