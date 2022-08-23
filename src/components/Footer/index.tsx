import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <div className="bg-black w-full p-6 text-center gap-5 flex flex-col items-center justify-center mt-10">
      <div className="flex items-center justify-center gap-3">
        <div>
          <Link href="https://instagram.com.br/emersongarrido.dev">
            <a>
              <img src="/assets/instagram-brands.svg" className="w-[15px]" />
            </a>
          </Link>
        </div>
        <div>
          <Link href="https://github.com/emersonGarrido">
            <a>
              <img src="/assets/github-brands.svg" className="w-[15px]" />
            </a>
          </Link>
        </div>
        <div>
          <Link href="https://www.linkedin.com/in/emersongarrido/">
            <a>
              <img src="/assets/linkedin-brands.svg" className="w-[15px]" />
            </a>
          </Link>
        </div>
      </div>
      <div className="font-light text-[14px]">
        <span className="flex items-center justify-center">
          Blog .dev | Todos os direitos reservados | Este projeto é{" "}
          <span className="font-bold ml-1">open-source</span>
        </span>
        <span className="flex items-center justify-center">
          <Link href="https://emersongarrido.com.br">
            <a>
              <b> Emerson Garrido </b>
            </a>
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Footer;
