import GetUpdated from "helpers/GetUpdated";
import React from "react";
import Link from "next/link";
interface CardNewsProps {
  className?: string;
  post: any;
}

const CardNews: React.FC<CardNewsProps> = ({ className, post }) => {
  return (
    <Link href={`/${post.attributes.slug}`}>
      <div
        style={{
          transition: "all .25s cubic-bezier(.02,.01,.47,1)",
        }}
        className={`${className} hover:-translate-y-2 mb-3 md:mb-0 shadow-sm shadow-black/30 cursor-pointer hover:bg-black/25 hover:ease-out rounded-b-lg h-[315px] md:h-[400px]`}
      >
        <div
          className="h-[160px] p-3 md:w-[371px] w-[300px] max-w-[371px] rounded-t-lg bg-gradient-to-r from-[#4e1c67] to-[#110E14]"
          style={{
            backgroundImage: `url('https://api-blog.emersongarrido.com.br${post?.attributes.media.data.attributes.url}')`,
            backgroundSize: "cover",
          }}
        >
          <img
            src="http://github.com/EmersonGarrido.png"
            className="w-[25px] h-[25px] rounded-full border-[0.13rem]"
          />
        </div>
        <div className="p-4 max-w-[340px] flex flex-col h-[160px] md:h-[240px] justify-between items-start">
          <div className="flex items-start md:justify-between flex-col md:gap-4 gap-2">
            <span className="text-[12px] md:text-[14px] text-[#B6B7F6]">
              {post?.attributes?.category?.data?.attributes?.title}
            </span>
            <h1 className="text-[#B4B4B4] md:text-[18px] font-medium">
              {post?.attributes?.title}
            </h1>
            <span className="text-[12px] md:text-[14px] text-[#B6B7F6]">
              {post?.attributes?.meta_description}
            </span>
          </div>
          <span className="text-[#B4B4B4] font-light text-[12px]">
            {GetUpdated(post?.attributes?.updatedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CardNews;
