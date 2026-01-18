import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner'; // 1. Importas la librería
import Login from './components/Login';
import Home from './components/Home'; 
import Dashboard from './components/Dashboard/Dashboard';
import NoticiasN from './components/NoticiasN';

import './index.css';

function App() {
  return (
    <>
      {/* 2. Colocas el Toaster aquí. "richColors" hace que el error sea rojo y el éxito verde */}
      <Toaster position="top-center" richColors closeButton />
      
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/noticias" element={<NoticiasN />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;