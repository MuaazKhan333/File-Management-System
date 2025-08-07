

import React, { useContext, useState } from "react";
import { FiSearch, FiEye } from "react-icons/fi";
import { BsListUl, BsGrid3X3Gap } from "react-icons/bs";
import { FileContext } from "../context/FileContext";

const Header = () => {
  const [activeView, setActiveView] = useState("list");
  const { setSearchQuery } = useContext(FileContext); // ✅ use from context

  return (
    <div className="p-2 shadow flex justify-between items-center">
      <div className="flex items-center gap-7">
        <h1 className="text-[25px] font-bold text-gray-600">Files</h1>
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Search files and folders"
            className="border border-gray-400 w-full text-gray-600 placeholder-gray-500 rounded pl-4 pr-8 py-1.5 text-sm focus:outline-none"
            onChange={(e) => setSearchQuery(e.target.value)} // ✅ update query
          />
          <FiSearch className="w-4 h-4 absolute top-2.5 right-3 text-gray-500" />
        </div>
      </div>

      <div className="flex items-center space-x-5">
        <button className="text-gray-400 hover:text-gray-600 hover:cursor-pointer">
          <FiEye className="w-5 h-5" />
        </button>

        <div className="flex space-x-1">
          <button
            className={`p-1 rounded ${
              activeView === "list"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-400 hover:bg-gray-100"
            }`}
            onClick={() => setActiveView("list")}
          >
            <BsListUl className="w-5 h-5" />
          </button>
          <button
            className={`p-1 rounded ${
              activeView === "grid"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-400 hover:bg-gray-100"
            }`}
            onClick={() => setActiveView("grid")}
          >
            <BsGrid3X3Gap className="w-5 h-5" />
          </button>
        </div>

        <select className="border border-gray-400 text-gray-600 rounded text-sm py-1.5 pl-2 pr-3 focus:outline-none mr-5">
          <option>Sort by</option>
          <option>Name</option>
          <option>Date</option>
          <option>Size</option>
        </select>
      </div>
    </div>
  );
};

export default Header;
