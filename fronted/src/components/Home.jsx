import React, {useState, useEffect} from 'react';
import Hero from './Hero';
import NavBar from './NavBar';
import Conocenos from './Conocenos';
import Ubicacion from './Ubicación';
import Footer from './Footer';
import Loading from './Loading';


const Home = () => {
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false); 
    }, 2000);
  }, []); 


  if (isLoading) {
    return <Loading />;
  }
  return (
    <>
      <NavBar />
      <Hero />
      <Conocenos />
      <Ubicacion />
      <Footer />
    </>
  );
};

export default Home;