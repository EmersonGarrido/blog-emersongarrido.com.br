import type { NextPage } from "next";
import { Header } from "components";

const Home: NextPage = () => {
  return (
    <div>
      <Header />
      <div className="w-full bg-black h-[250px] md:h-[450px] flex items-center flex-col p-4 md:p-0 justify-center">
        <h1 className="text-[28px] font-bold md:text-[52px]">Blog do Emerson Garrido</h1>
        <span className="text-[14px] md:text-[18px] text-center">
          Conteúdos focados em desenvolvimento e tutoriais do <b>básico</b> ao{" "}
          <b>avançado.</b>
        </span>
      </div>
      <div className="flex items-center justify-center p-4 font-thin text-[28px]">
        <h1>Em desenvolvimento...</h1>
      </div>
     <div className="text-[14px] font-thin">
     <span className="flex items-center justify-center">Todos os direitos reservados a </span>
      <span className="flex items-center justify-center"><a href="https://emersongarrido.com.br"><b> Emerson Garrido </b> </a></span>
     </div>
    </div>
  );
};

export default Home;
