import React from "react";
import Link from "next/link";

const Header: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex items-center justify-center w-[1200px] p-6">
        <div className="w-full flex items-center gap-3">
          <Link href="/">
            <a>
              <img src="/assets/logo.png" className="w-[50px] cursor-pointer" />
            </a>
          </Link>

          <h1 className="text-[#343434]">|</h1>
          <h1 className="text-[#8257E6]">Blog</h1>
          <ul className=" hidden items-center justify-center gap-5 ml-8 text-[#B4B4B4] text-[16px]">
            <li className="hover:cursor-pointer hover:text-[#fff]">Back-end</li>
            <li className="hover:cursor-pointer hover:text-[#fff]">
              Front-end
            </li>
            <li className="hover:cursor-pointer hover:text-[#fff]"> Mobile </li>
          </ul>
        </div>
        <div className=" w-[30px] cursor-pointer">
          <Link href="https://github.com/EmersonGarrido">
            <a target="_blank">
              <img src="/assets/github-brands.svg" />
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
