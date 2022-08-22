import React from "react";

interface CardNewsProps {
  className?: string;
}

const CardNews: React.FC<CardNewsProps> = ({ className }) => {
  return (
    <div
      className={`${className} shadow-xl shadow-black/20 rounded-b-lg h-[315px]`}
    >
      <div className="h-[160px] p-3 md:w-[320px] w-[340px] max-w-[340px] rounded-t-lg bg-[url('https://blog.rocketseat.com.br/content/images/size/w600/2022/02/cleancode-rocketseat-blog.png')]">
        <img
          src="http://github.com/EmersonGarrido.png"
          className="w-[25px] h-[25px] rounded-full border-[0.13rem]"
        />
      </div>
      <div className="p-4 max-w-[340px] flex flex-col h-[160px] justify-between items-start">
        <div className="flex items-start flex-col gap-2">
          <span className="text-[12px] text-[#8257E6]">comunidade</span>
          <h1 className="text-[#B4B4B4] font-medium">
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
