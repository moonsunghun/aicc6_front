import React from 'react';
import { IoAddCircleOutline } from 'react-icons/io5';

const AddItem = () => {
  return (
    <div className="add-card   h-[25vh] p-[0.25rem]">
      <div className="w-full h-full border border-gray-500 rounded-md flex py-3 items-center justify-center hover:bg-gray-800/50 transition-all duration-300">
        <div className="flex items-center gap-2 group">
          <IoAddCircleOutline className="w-8 h-8 text-gray-400 font-light group-hover:text-gray-200 transition-all duration-300" />
          <span className="text-gray-400 group-hover:text-gray-200 transition-all duration-300">할일 추가하기</span>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
