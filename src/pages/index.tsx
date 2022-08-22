import type { NextPage } from "next";
import Link from "next/link";
import { Header, CardNews, Footer, CardTopNews } from "components";

const Home: NextPage = () => {
  return (
    <div className="flex items-center justify-center flex-col">
      <Header />

      <div className="w-full bg-black h-[250px] md:h-[380px] flex items-center flex-col p-4 md:p-0 justify-center">
        <h1 className="text-[28px] font-bold md:text-[52px]">
          Blog do Emerson Garrido
        </h1>
        <span className="text-[14px] md:text-[18px] text-center">
          Conteúdos focados em desenvolvimento e tutoriais do <b>básico</b> ao{" "}
          <b>avançado.</b>
        </span>
      </div>

      <div className="md:p-6 md:mt-10 flex md:w-[1130px] flex-col md:flex-row justify-between items-center gap-3">
        <CardTopNews />
      </div>

      <div className="md:p-6 p-4 flex md:w-[1130px] flex-col md:flex-row justify-between items-center gap-5">
        <CardNews />
        <CardNews />
        <CardNews />
      </div>

      <Footer />
    </div>
  );
};

export default Home;
