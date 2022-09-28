import type { NextPage } from "next";
import { fetchAPI } from "../lib/api";
import { Header, CardNews, Footer, CardTopNews, Seo } from "components";

interface ContentProps {
  posts: any;
  destaques: any;
}

const Home: NextPage<ContentProps> = ({ posts, destaques }) => {
  return (
    <div className="flex items-center justify-center flex-col">
      <Header />
      <Seo
        seo={{
          metaTitle: ".dev | Blog do Garrido",
          metaDescription:
            "Blog pessoal do desenvolvedor Emerson Garrido @emersongarrido.dev no Instagram.",
          image:
            "https://www.infoguard.ch/hubfs/images/blog/infoguard-blog-easter-egg-1.jpg",
        }}
      />

      <div className="w-full bg-black h-[250px] md:h-[380px] flex items-center flex-col p-4 md:p-0 justify-center">
        <h1 className="text-[28px] font-bold md:text-[52px]">
          Blog do Emerson Garrido
        </h1>
        <span className="text-[14px] md:text-[18px] text-center">
          Conteúdos focados em desenvolvimento e tutoriais do <b>básico</b> ao{" "}
          <b>avançado.</b>
        </span>
      </div>

      <div className="flex items-center justify-center flex-col">
        <div className="md:p-6 md:mt-10 flex md:w-[1130px] w-full flex-col md:flex-row justify-between items-center gap-3">
        <CardTopNews data={destaques} />
      </div>

        <div className="grid grid-cols-1 md:gap-10 w-full md:w-[1130px] md:grid-cols-3 md:ml-12">
        {posts.data?.map((post: any) => {
          return <CardNews key={post.id} post={post} />;
        })}
      </div>
      </div>

      <Footer />
    </div>
  );
};

export async function getStaticProps() {
  const [posts, destaques] = await Promise.all([
    fetchAPI(
      "/posts?pagination[limit]=6&sort=id:DESC&populate=media&populate=category&filters[highlight]=false"
    ),
    fetchAPI(
      "/posts?pagination[limit]=2&populate=category&populate=media&sort=id:DESC&filters[highlight]=true"
    ),
  ]);

  return {
    props: { posts, destaques },
    revalidate: 1,
  };
}

export default Home;

