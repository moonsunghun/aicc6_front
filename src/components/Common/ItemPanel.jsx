import React, { useEffect, useState, useRef } from 'react';
import Item from './Item';
import { useDispatch, useSelector } from 'react-redux';
import AddItem from './AddItem';
import PageTitle from './PageTitle';
import { fetchGetItems, fetchPostTask } from '../../redux/slices/apiSlice';
import { SkeletonTheme } from 'react-loading-skeleton';
import LoadingSkeleton from './LoadingSkeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiCalendar } from "react-icons/fi";

const ItemPanel = ({ pageTitle }) => {
  // Auth Data Variables
  const authData = useSelector((state) => state.auth.authData);

  let userKey = ""; 
  if(authData?.acc_type == "local" || authData?.acc_type == "kakao" || authData?.acc_type == "naver"  )
  {
    console.log(authData?.auth_type)
    userKey = authData?.id; 
  }
  else
  {
    console.log(authData?.auth_type)
    userKey = authData?.sub; 
  }
  // API Data Variable
  const getTasksData = useSelector((state) => state.api.getItemsData);
  const dispatch = useDispatch();

  // Loading Skeleton
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    import: false,
    completed: false,
    date: '',
  });

  const dateInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = {
      title: newItem.title,
      description: newItem.description,
      date: newItem.date,
      isCompleted: newItem.completed,
      isImportant: newItem.import,
      userId: userKey,
    };
    try {
      await dispatch(fetchPostTask(taskData)).unwrap();
      setIsOpen(false);
      setNewItem({ title: '', description: '', import: false, completed: false, date: '' });
      await dispatch(fetchGetItems(userKey));
    } catch (error) {
      alert('등록 실패');
    }
  };

  useEffect(() => {
    if (!userKey) return;

    const fetchGetItemsData = async () => {
      try {
        setLoading(true);
        await dispatch(fetchGetItems(userKey)).unwrap(); 
      } catch (error) {
        console.log('Fail to fetch items', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGetItemsData();
  }, [dispatch, userKey]);

  return (
    <div className="panel bg-[#212121] w-4/5 h-full rounded-md border border-gray-500 py-5 px-4 overflow-y-auto">
      {userKey ? (
        <div className="login-message w-full h-full">
          <PageTitle title={pageTitle} />
          <div className="flex flex-wrap">
            {/* {getTasksData?.map((task, idx) => (
              <Item key={idx} task={task} />
            ))} */}
            {loading ? (
              <SkeletonTheme 
                baseColor='#202020'
                highlightColor='#444' 
                height="25vh"
              > 
                <LoadingSkeleton />
              </SkeletonTheme>
            ) : (
              getTasksData?.map((task, idx) => (
                <Item key={idx} task={task} />
              ))
            )}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <div className="cursor-pointer w-1/3 h-[25vh] p-[0.25rem]">
                  <AddItem />
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-[#212121] border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">Title</Label>
                    <Input
                      id="title"
                      value={newItem.title}
                      onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Input
                      id="description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-white">Date</Label>
                    <div className="relative">
                      <Input
                        id="date"
                        type="date"
                        ref={dateInputRef}
                        value={newItem.date}
                        onChange={e => setNewItem({ ...newItem, date: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white pr-10"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => dateInputRef.current && dateInputRef.current.showPicker && dateInputRef.current.showPicker()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        style={{ background: "none", border: "none", padding: 0, margin: 0 }}
                      >
                        <FiCalendar size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="import"
                      type="checkbox"
                      checked={newItem.import}
                      onChange={e => setNewItem({ ...newItem, import: e.target.checked })}
                      className="accent-blue-600 w-4 h-4"
                    />
                    <Label htmlFor="import" className="text-white">Important</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="completed"
                      type="checkbox"
                      checked={newItem.completed}
                      onChange={e => setNewItem({ ...newItem, completed: e.target.checked })}
                      className="accent-blue-600 w-4 h-4"
                    />
                    <Label htmlFor="completed" className="text-white">Completed</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="border-gray-700 text-black hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add Item
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ) : (
        <div className="login-message w-full h-full flex items-center justify-center">
          <button className="flex justify-center items-center gap-2 bg-gray-300 text-gray-900 py-2 px-4 rounded-md">
            <span className="text-sm font-semibold">
              로그인이 필요한 서비스 입니다.
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemPanel;
