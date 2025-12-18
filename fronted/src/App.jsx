import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Home from './components/Home'; 
import Dashboard from './components/Dashboard/Dashboard';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Aquí defines la ruta raíz y le asignas el componente Home */}
        <Route path="/" element={<Home />} />
        
        {/* Mantienes la ruta de login */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;