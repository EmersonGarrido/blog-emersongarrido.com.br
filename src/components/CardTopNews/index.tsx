import React from "react";
import Link from "next/link";
import { CardNews } from "components";

const CardTopNews: React.FC = () => {
  return (
    <div className="flex items-center justify-center flex-col md:flex-row gap-5">
      <Link href="/teste-novo">
        <div
          style={{
            transition: "all .25s cubic-bezier(.02,.01,.47,1)",
          }}
          className={`mb-5 md:mb-0 shadow-md shadow-black/20 cursor-pointer hover:bg-black/25 hover:ease-out rounded-b-lg  hover:-translate-y-2`}
        >
          <div className="md:h-[400px] md:w-[762px] w-full h-[200px] flex items-center md:items-start md:justify-start justify-center p-4 md:p-8  md:rounded-lg bg-gradient-to-r from-[#4e1c67] to-[#110E14]">
            <div className="flex items-start flex-col md:justify-between justify-center h-full gap-3 w-full">
              <div className="flex flex-col gap-4 w-full">
                <div className="w-full flex justify-between items-center">
                  <img
                    src="http://github.com/EmersonGarrido.png"
                    className="w-[25px] h-[25px] md:h-[35px] md:w-[35px] rounded-full border-[0.13rem]"
                  />
                  <div className=" text-black pt-1 pb-1 pl-2 pr-2 font-mono text-[10px] rounded-full bg-white">
                    Em Destaque
                  </div>
                </div>
                <span className="text-[12px] md:text-[16px] text-[#B6B7F6]">
                  comunidade
                </span>
                <h1 className="text-white font-medium flex md:text-[32px] max-w-[500px]">
                  Comunidade: guia prático de como contribuir para o ecossistema
                  de tecnologia
                </h1>
              </div>
              <div>
                <span className="text-white font-light text-[12px] ">
                  há 3 meses
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <CardNews />
    </div>
  );
};

export default CardTopNews;
