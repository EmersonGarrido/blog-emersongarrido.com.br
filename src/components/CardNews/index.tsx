import React from "react";

interface CardNewsProps {
  className?: string;
}

const CardNews: React.FC<CardNewsProps> = ({ className }) => {
  return (
    <div
      className={`${className} mb-3 md:mb-0 shadow-md shadow-black/20 cursor-pointer hover:bg-black/25 hover:ease-out rounded-b-lg h-[315px] md:h-[420px]`}
    >
      <div className="h-[160px] p-3 md:w-[371px] w-[300px] max-w-[371px] rounded-t-lg bg-[url('https://blog.rocketseat.com.br/content/images/size/w600/2022/02/cleancode-rocketseat-blog.png')]">
        <img
          src="http://github.com/EmersonGarrido.png"
          className="w-[25px] h-[25px] rounded-full border-[0.13rem]"
        />
      </div>
      <div className="p-4 max-w-[300px] flex flex-col h-[160px] md:h-[240px] justify-between items-start">
        <div className="flex items-start md:justify-between flex-col md:gap-4 gap-2">
          <span className="text-[12px] md:text-[14px] text-[#B6B7F6]">
            comunidade
          </span>
          <h1 className="text-[#B4B4B4] md:text-[18px] font-medium">
            Comunidade: guia prático de como contribuir para o ecossistema de
            tecnologia
          </h1>
        </div>
        <span className="text-[#B4B4B4] font-light text-[12px]">
          há 3 meses
        </span>
      </div>
    </div>
  );
};

export default CardNews;
