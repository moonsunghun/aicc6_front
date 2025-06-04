import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Completed from './components/Completed';
import Important from './components/Important';
import Proceeding from './components/Proceeding';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import KakaoCallback from './components/Auth/KakaoCallback';
import NaverCallback from './components/Auth/NaverCallback'; // NaverCallback 컴포넌트 import

function App() {

  useEffect(() => {
    // Kakao SDK 초기화
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
      console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
    }
  }, []);

  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/completed" element={<Completed />} />
          <Route path="/important" element={<Important />} />
          <Route path="/proceeding" element={<Proceeding />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />  
          <Route path="/auth/naver/callback" element={<NaverCallback />} />

        </Routes>

        <ToastContainer
          position = "bottom-center"
          autoClose = {1000}
          theme='light' 
          
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
