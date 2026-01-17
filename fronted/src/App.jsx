import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home'; 
import Dashboard from './components/Dashboard/Dashboard';
import NoticiasN from './components/NoticiasN';

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
        <Route path="/noticias" element={
          <NoticiasN />} 
          />
      </Routes>
    </Router>
  );
}

export default App;