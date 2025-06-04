import React, { useState } from 'react';
import { MdEditDocument } from 'react-icons/md';
import { FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  fetchGetItems,
  fetchUpdateCompleted,
  fetchDeleteTask,
} from '../../redux/slices/apiSlice';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Item = ({ task }) => {
  // console.log(task);
  const { _id, title, description, date, iscompleted, isimportant, userid } =
    task;
  const dispatch = useDispatch();

  const [isCompleted, setIsCompleted] = useState(iscompleted);
  const [openDetail, setOpenDetail] = useState(false);

  const changeCompleted = async () => {
    // setIsCompleted(!isCompleted)을 호출하면 상태 업데이트가 비동기적으로 이루어지기 때문에, isCompleted의 값이 즉시 변경되지 않는다.
    // 따라서 updateCompletedData 객체를 생성할 때 isCompleted의 이전 값이 사용된다. 이로 인해 true/false가 한 단계씩 밀리게 된다.

    // 상태를 미리 업데이트 하여 반영된 값을 사용
    const newIsCompleted = !isCompleted;
    setIsCompleted(newIsCompleted);

    const updateCompletedKeys = {
      itemId: _id,
      isCompleted: newIsCompleted,
    };

    const options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateCompletedKeys),
    };

    try {
      await dispatch(fetchUpdateCompleted(options)).unwrap();
      newIsCompleted ? toast.success('완료') : toast.error('미완료');
      await dispatch(fetchGetItems(userid)).unwrap();
    } catch (error) {
      toast.error('상태 변경 실패');
    }
  };

  const handleDelete = async () => {
    try {
      console.log(_id)
      await dispatch(fetchDeleteTask(_id)).unwrap();
      await dispatch(fetchGetItems(userid)).unwrap();
      toast.success('삭제 완료');
    } catch (error) {
      console.log(error);
      toast.error('삭제 실패');
    }
  };

  const textLengthOverCut = (text, length, lastTxt) => {
    if (length === '' || length === null) {
      length = 20;
    }
    if (lastTxt === '' || lastTxt === null) {
      lastTxt = '...';
    }
    if (text.length > length) {
      text = text.substr(0, length) + lastTxt;
    }
    return text;
  };
  return (
    <div className="item w-1/3 h-[25vh] p-[0.25rem]">
      <div className="w-full h-full border border-gray-500 rounded-md flex py-3 px-4 flex-col justify-between bg-gray-950">
        <div className="upper">
          <h2 className="text-xl font-normal mb-3 relative pb-2 flex justify-between border-b">
            <span className=" bottom-0">{title}</span>
            <Dialog open={openDetail} onOpenChange={setOpenDetail}>
              <DialogTrigger asChild>
                <span className="text-sm py-1 px-3 border border-gray-500 rounded-sm hover:bg-gray-700 cursor-pointer" onClick={() => setOpenDetail(true)}>
                  자세히
                </span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-[#212121] border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Task Detail</DialogTitle>
                </DialogHeader>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">Title</Label>
                    <Input id="title" value={title} readOnly className="bg-gray-800 border-gray-700 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Input id="description" value={description} readOnly className="bg-gray-800 border-gray-700 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-white">Date</Label>
                    <Input id="date" value={date} readOnly className="bg-gray-800 border-gray-700 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input id="important" type="checkbox" checked={isimportant} readOnly className="accent-blue-600 w-4 h-4" />
                    <Label htmlFor="important" className="text-white">Important</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input id="completed" type="checkbox" checked={iscompleted} readOnly className="accent-blue-600 w-4 h-4" />
                    <Label htmlFor="completed" className="text-white">Completed</Label>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>
            {textLengthOverCut(description, 25, '...')}
          </p>
        </div>
        <div className="lower">
          <p className="text-sm mb-1">{date}</p>
          <div className="item-footer flex justify-between">
            <div className="item-footer-left flex gap-2">
              {iscompleted ? (
                <button
                  className="block py-1 px-4 bg-green-400 text-sm text-white rounded-md"
                  onClick={changeCompleted}
                >
                  Completed
                </button>
              ) : (
                <button
                  className="block py-1 px-4 bg-cyan-500 text-sm text-white rounded-md"
                  onClick={changeCompleted}
                >
                  Incompleted
                </button>
              )}
              {isimportant && (
                <button className="block py-1 px-4 bg-red-500 text-sm text-white rounded-md">
                  Important
                </button>
              )}
            </div>
            <div className="item-footer-right flex gap-2">
              <button>
                <MdEditDocument className="w-5 h-5" />
              </button>
              <button onClick={handleDelete}>
                <FaTrash className="" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Item;
