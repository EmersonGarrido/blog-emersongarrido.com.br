import type { NextPage } from "next";
import Link from "next/link";
import { Header, Footer } from "components";

const Home: NextPage = () => {
  return (
    <div className="flex items-center justify-center flex-col">
      <Header />

      <div className="w-full bg-black h-[250px] md:h-[380px] flex items-center flex-col p-4 md:p-0 justify-center"></div>

      <div className="md:p-6 md:mt-10 flex  md:w-[1130px] flex-col justify-between items-center gap-3">
        <div className="text-center w-full">
          <h1 className="text-[28px] font-bold md:text-[42px] text-[#B1B1B1]">
            Boas práticas para devs em início de carreira
          </h1>
          <span className="text-[14px] md:text-[18px] text-center text-[#B1B1B1]">
            Conteúdos focados em desenvolvimento e tutoriais do <b>básico</b> ao{" "}
            <b>avançado.</b>
          </span>
          <div className="text-center text-[14px] font-bold text-[#B6B7F6] mt-10 mb-10">
            <p>Carreira • 23 de Mai de 2022</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-[#B1B1B1]">
          <h1 className="text-[28px] font-bold">Defina sua jornada</h1>
          <p>
            Antes de tudo, você precisa saber para onde está indo. Iniciantes na
            programação costumam se perder em meio a tanta informação. Você
            precisa ter objetivos bem definidos para traçar a melhor rota de
            evolução na carreira. Certifique-se de ter uma base sólida nos
            fundamentos da programação. Só depois de conhecer o básico, você
            saberá para onde seguir. Esse curso gratuito ensina programação
            desde o marco zero, para quem nunca teve contato com tecnologia e
            ajuda a consolidar conhecimentos padrões.
          </p>
          <h1 className="text-[28px] font-bold">Escolha uma linguagem</h1>
          <p>
            Conhecer uma única tecnologia profundamente vai te ajudar mais que
            saber várias superficialmente. Isso não significa que você nunca
            poderá aprender outras no futuro, apenas que vai direcionar seu foco
            para um objetivo de aprendizagem. Dominando uma linguagem você se
            aproxima de empresas que costumam buscar por pessoas que cumpram
            papéis específicos em um time de tecnologia. Acompanhando a evolução
            das ferramentas que usa, você não deixa que suas aplicações fiquem
            ultrapassadas e continua relevante para o mercado.
          </p>
        </div>
      </div>

      <div className="border-t-white/5 border-t-[0.1rem] md:p-6 md:mt-10 flex  w-full flex-col justify-between items-center gap-3">
        <div className="flex gap-4 items-center justify-start">
          <img
            src="http://github.com/EmersonGarrido.png"
            className="w-[75px] h-[75px] rounded-full border-[0.13rem]"
          />
          <div>
            <h1 className="font-light text-[18px] m-0 text-[#B1B1B1]">
              Emerson Garrido
            </h1>
            <span className="font-light text-[14px] text-[#d2d2d2]">
              @emersongarrido.dev
            </span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
