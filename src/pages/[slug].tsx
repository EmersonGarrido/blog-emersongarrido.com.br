import type { NextPage } from "next";
import Link from "next/link";
import ReactHtmlParser from "react-html-parser";
import { Header, Footer, Seo } from "components";
import { fetchAPI } from "lib/api";
import GetUpdated from "helpers/GetUpdated";

const strapiUrl = "https://api-blog.emersongarrido.com.br";

const Home: NextPage = ({ post }: any) => {
  console.log(post.attributes);
  return (
    <div className="flex items-center justify-center flex-col">
      <Header />

      <Seo
        seo={{
          metaTitle: `.dev | ${post.attributes.title}`,
          metaDescription: `${post.attributes.meta_description}`,
          image: `${strapiUrl}${post.attributes.media.data.attributes.url}`,
        }}
      />

      <div
        className="w-full bg-black h-[250px] md:h-[380px] flex items-center flex-col p-4 md:p-0 justify-center"
        style={{
          backgroundSize: "cover",
          backgroundImage: `url('${strapiUrl}${post.attributes.media.data.attributes.url}')`,
        }}
      ></div>

      <div className="md:p-6 md:mt-10 flex  md:w-[900px] w-[360px] mb-6 flex-col justify-between items-center gap-3">
        <div className="text-center w-full">
          <h1 className="text-[28px] font-bold md:text-[42px] text-[#B1B1B1]">
            {post.attributes.title}
          </h1>
          <span className="text-[14px] md:text-[18px] text-center text-[#B1B1B1]">
            {post.attributes.meta_description}
          </span>
          <div className="text-center text-[14px] font-bold text-[#B6B7F6] mt-10 mb-10">
            <p>
              {post.attributes.category.data.attributes.title} •{" "}
              {GetUpdated(post?.attributes?.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-[#B1B1B1]">
          {ReactHtmlParser(
            post.attributes.content.replace(
              /\/uploads\//gi,
              `${strapiUrl}/uploads/`
            )
          )}
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

export const getStaticPaths = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export async function getStaticProps({ params }: any) {
  const [post] = await Promise.all([
    fetchAPI(
      `/posts?filters[slug]=${params.slug}&populate=category&populate=media`
    ),
  ]);

  return {
    props: {
      post: post.data[0],
    },
    revalidate: 60,
  };
}

