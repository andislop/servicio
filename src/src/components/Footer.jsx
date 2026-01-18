import React from "react";
import Corpoelec from "../assets/corpoelec.png";
import Gas from "../assets/gas-lara.jpg";
import Hidrolara from "../assets/hidrolara.jpeg";
import Patria from "../assets/patria.jpg";

const Footer = () => {
  return (
    <footer className="bg-navbar-bg py-8" id="footer">
      <div className="container mx-auto">
        <div className="flex justify-center text-center">
          <ul className="flex flex-wrap justify-center items-center gap-6">
            <li>
              <a
                className="text-light text-decoration-none transition-transform hover:scale-110 transform inline-block duration-300"
                target="_blank"
                href="https://pagos.corpoelec.com.ve/login"
              >
                <img
                  src={Corpoelec}
                  alt="Logo Corpoelec"
                  className="w-[140px] h-auto"
                />
              </a>
            </li>
            <li>
              <a
                className="text-light text-decoration-none transition-transform hover:scale-110 transform inline-block duration-300"
                target="_blank"
                href="https://www.patria.org.ve/"
              >
                <img
                  src={Patria}
                  alt="Logo Patria"
                  className="w-[140px] h-auto"
                />
              </a>
            </li>
            <li>
              <a
                className="text-light text-decoration-none transition-transform hover:scale-110 transform inline-block duration-300"
                target="_blank"
                href="https://www.gaslara.gob.ve/"
              >
                <img
                  src={Gas}
                  alt="Logo Gas Lara"
                  className="w-[140px] h-auto"
                />
              </a>
            </li>
            <li>
              <a
                className="text-light text-decoration-none transition-transform hover:scale-110 transform inline-block duration-300"
                target="_blank"
                href="https://hidrolara.lara.gob.ve/"
              >
                <img
                  src={Hidrolara}
                  alt="Logo Hidrolara"
                  className="w-[140px] h-auto"
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
