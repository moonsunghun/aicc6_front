import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { SiKakaotalk, SiNaver } from 'react-icons/si';
import { FaUser } from 'react-icons/fa';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../../redux/slices/authSlice';
import { fetchPostAccount, fetchPostCreateAccount, fetchPostLogin } from '../../redux/slices/apiSlice';
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
import { toast } from 'react-toastify'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { navMenus } from '../../utils/menuList';

const Navbar = () => {
  // Router hooks
  const path = useLocation();
  const isActive = (idx) => path.pathname === idx;

  // Redux hooks
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.authData);
  const { name } = user || {};

  // Environment variables
  const googleClientId = import.meta.env.VITE_AUTH_CLIENT_ID;

  // Local state
  const [isAuth, setIsAuth] = useState(false);
  const [authType, setAuthType] = useState(""); 
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  
  // Form states
  const [loginData, setLoginData] = useState({ id: '', pwd: '' });
  const [signupData, setSignupData] = useState({ 
    id: '', 
    pwd: '', 
    pwdConfirm: '', 
    user_nm: '' 
  });
  const [signupErrors, setSignupErrors] = useState({
    id: '',
    pwd: '',
    pwdConfirm: '',
    user_nm: ''
  });

  useEffect(() => {
    // 컴포넌트 마운트 시 localStorage에서 인증 데이터 확인
    const storedAuthData = JSON.parse(localStorage.getItem('authData')); 
    if (storedAuthData) {
      dispatch(login({ authData: storedAuthData }));
      setIsAuth(true); 
    }
  }, [dispatch]);

  // Local 로그인 
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(fetchPostLogin({ 
        id: loginData.id,
        pwd: loginData.pwd
      })).unwrap();

      //console.log(result.success);

      if (result.success) {
        // 로그인 성공 시 로직
        const authData = {
          id: result.data.id, // 백엔드 응답 구조에 따라 수정 필요
          user_nm: result.data.user_nm, // 백엔드 응답 구조에 따라 수정 필요
          acc_type : "local",
          name : result.data.user_nm,
          // 필요한 다른 사용자 정보도 추가
        };
        dispatch(login({ authData }));
        setIsAuth(true);
        setAuthType("local");
        toast.success('로그인 성공!');
        setIsLoginOpen(false);
      } else {
        // 백엔드에서 success: false와 함께 메시지를 보낼 경우 처리
        toast.error(result.msg || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      // API 호출 자체에서 에러가 발생한 경우 (예: 네트워크 오류, 서버 오류 등)
      toast.error(error.message || '로그인 중 오류가 발생했습니다.');
    }
  };

  
  //Google
  const handleLoginSuccess = useCallback(
    async (credentialResponse) => {
      try {
        const decoded = jwtDecode(credentialResponse.credential);
        
        // 백엔드에 계정 정보 저장
        await dispatch(fetchPostAccount({
          //id: decoded.sub,           // Google의 고유 ID
          id: decoded.email,           // Google의 고유 ID
          pwd : '',
          user_nm: decoded.name,        // 사용자 이름
          acc_type: 'google',            // 계정 타입
          acc_key: decoded.sub          // Google의 고유 ID
        })).unwrap();

        dispatch(login({ authData: decoded }));
        setIsAuth(true);
        setAuthType("google");
      } catch (error) {
        console.error('Google Login Error', error);
        toast.error('구글 로그인 중 오류가 발생했습니다.');
      }
    },
    [dispatch]
  );
  
  //카카오
  const handleKakaoLoginClick = () => {
    if (window.Kakao) {
      window.Kakao.Auth.authorize({
        redirectUri: 'http://localhost:5173/auth/kakao/callback',
        scope: 'profile_nickname',
      });

    } else {
      console.error('Kakao SDK가 로드되지 않았습니다.');
      toast.error('카카오 로그인 기능을 사용할 수 없습니다.');
    }
 
  };  

  // Naver
  const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_NAVER_CALLBACK_URL;

  const naverLogin = () => {
    const state = Math.random().toString(36).substr(2, 11);
    localStorage.setItem('naverState', state);
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state} `;
    window.location.href = naverAuthUrl;
  };

  const handleLogoutClick = () => {
    // 로그인 타입에 따라 외부 서비스 로그아웃 처리
    if (user && user.acc_type === 'kakao') {
      if (window.Kakao && window.Kakao.Auth) {
        window.Kakao.Auth.logout(() => {
          console.log('카카오 로그아웃 완료', window.Kakao.Auth.getAccessToken()); // Access Token이 null이 되어야 합니다.
          // 카카오 로그아웃 성공 후 내부 로그아웃 처리
          dispatch(logout());
          setIsAuth(false);
          toast.success('로그아웃 되었습니다.');
        });
      } else {
         console.error('Kakao SDK 또는 Auth 모듈이 로드되지 않았습니다.');
         // SDK 로드 안 되어도 내부 로그아웃은 진행
         dispatch(logout());
         setIsAuth(false);
         toast.success('로그아웃 되었습니다.');
      }
    } else if (user && user.acc_type === 'google') {
      // Google 로그인의 클라이언트 측 로그아웃 (선택 사항: 일반적으로 서버 측에서 세션 무효화)
      // Google Identity Services 라이브러리를 사용한다면 disableAutoSelect 등을 호출할 수 있습니다.
      // 여기서는 간단히 내부 로그아웃만 진행합니다.
      // google.accounts.id.disableAutoSelect(); // 필요시 추가
      dispatch(logout());
      setIsAuth(false);
      toast.success('로그아웃 되었습니다.');

    } else {
      // 일반 로그인 또는 user 정보가 없는 경우 내부 로그아웃만 진행
      dispatch(logout());
      setIsAuth(false);
      toast.success('로그아웃 되었습니다.');
    }
  };

  const handleLoginError = (error) => {
    console.log('Google Login Error', error);
    toast({
      variant: "destructive",
      title: "로그인 실패",
      description: "구글 로그인 중 오류가 발생했습니다.",
    });
  };

  


  const validateSignupForm = () => {
    const errors = {
      id: '',
      pwd: '',
      pwdConfirm: '',
      user_nm: ''
    };
    let isValid = true;

    if (!signupData.id.trim()) {
      errors.id = '아이디를 입력해주세요.';
      isValid = false;
    }

    if (!signupData.pwd.trim()) {
      errors.pwd = '비밀번호를 입력해주세요.';
      isValid = false; 
    }

    if (!signupData.pwdConfirm.trim()) {
      errors.pwdConfirm = '비밀번호 확인을 입력해주세요.';
      isValid = false;
    } else if (signupData.pwd !== signupData.pwdConfirm) {
      errors.pwdConfirm = '비밀번호가 일치하지 않습니다.';
      isValid = false;
    }

    if (!signupData.user_nm.trim()) {
      errors.user_nm = '이름을 입력해주세요.';
      isValid = false;
    }

    setSignupErrors(errors);
    return isValid;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSignupForm()) {
      return;
    }

    try {
      const result = await dispatch(fetchPostCreateAccount({
        id: signupData.id,
        pwd: signupData.pwd,
        user_nm: signupData.user_nm,
        acc_type: 'local'
      })).unwrap();

      toast.success('회원가입이 완료되었습니다.');
      setIsSignupOpen(false);
      setSignupData({ id: '', pwd: '', pwdConfirm: '', user_nm: '' });
      setSignupErrors({ id: '', pwd: '', pwdConfirm: '', user_nm: '' });
    } catch (error) {
      console.error('Signup Error:', error);
      toast.error(error.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  

  return (
    <nav className="bg-[#212121] w-1/5 h-full rounded-sm border border-gray-500 py-10 px-4 flex flex-col justify-between items-center">
      <div className="logo-wrapper flex w-full items-center justify-center gap-8">
        <div className="logo"></div>
        <h2 className="font-semibold text-xl">
          <Link to="/">MARSHALL</Link>
        </h2>
      </div>
      <ul className="menus w-full">
        {navMenus.map((menu, idx) => (
          <li
            key={idx}
            className={`rounded-sm mb-1 border border-gray-700 hover:bg-gray-950 transition-all duration-300 ${
              isActive(menu.to) ? 'bg-gray-950' : ''
            }`}
          >
            <Link to={menu.to} className="flex gap-x-4 items-center py-2 px-10">
              {menu.icon} {menu.label}
            </Link>
          </li>
        ))}
      </ul>

      {isAuth ? (
        <div className="w-4/5 flex items-center">
          <button
            className={`flex justify-center items-center gap-2 text-gray-900 py-3 px-4 rounded-md w-full
              ${user.acc_type === 'kakao' ? 'bg-yellow-300' : 'bg-gray-300'}
            `}
            onClick={handleLogoutClick}
          >
            {authType === "local" ? (
              <FaUser className="w-5 h-5"/> 
            ) : authType === "google" ? (
              <FcGoogle className="w-5 h-5"/>
            ) : authType === "naver" ? (
              <SiNaver className="w-5 h-5"/>
            ) : (
              <SiKakaotalk className="w-5 h-5"/>
            )}
            <span className="text-sm">{name}님 로그아웃</span>
          </button>
        </div>
      ) : (
        <div className="auth-wrapper flex flex-col gap-2 w-4/5">
          <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                로그인
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#212121] border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">로그인</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-id" className="text-white">아이디</Label>
                  <Input
                    id="login-id"
                    value={loginData.id}
                    onChange={(e) => setLoginData({...loginData, id: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-pwd" className="text-white">비밀번호</Label>
                  <Input
                    id="login-pwd"
                    type="password"
                    value={loginData.pwd}
                    onChange={(e) => setLoginData({...loginData, pwd: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsLoginOpen(false)}
                    className="border-gray-700 text-black hover:bg-gray-800"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    로그인
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gray-700 hover:bg-gray-800 text-white">
                회원가입
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#212121] border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">회원가입</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-id" className="text-white">아이디</Label>
                  <Input
                    id="signup-id"
                    value={signupData.id}
                    onChange={(e) => setSignupData({...signupData, id: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {signupErrors.id && (
                    <p className="text-red-500 text-sm">{signupErrors.id}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-pwd" className="text-white">비밀번호</Label>
                  <Input
                    id="signup-pwd"
                    type="password"
                    value={signupData.pwd}
                    onChange={(e) => setSignupData({...signupData, pwd: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {signupErrors.pwd && (
                    <p className="text-red-500 text-sm">{signupErrors.pwd}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-pwd-confirm" className="text-white">비밀번호 확인</Label>
                  <Input
                    id="signup-pwd-confirm"
                    type="password"
                    value={signupData.pwdConfirm}
                    onChange={(e) => setSignupData({...signupData, pwdConfirm: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {signupErrors.pwdConfirm && (
                    <p className="text-red-500 text-sm">{signupErrors.pwdConfirm}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-white">이름</Label>
                  <Input
                    id="signup-name"
                    value={signupData.user_nm}
                    onChange={(e) => setSignupData({...signupData, user_nm: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {signupErrors.user_nm && (
                    <p className="text-red-500 text-sm">{signupErrors.user_nm}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsSignupOpen(false);
                      setSignupData({ id: '', pwd: '', pwdConfirm: '', user_nm: '' });
                      setSignupErrors({ id: '', pwd: '', pwdConfirm: '', user_nm: '' });
                    }}
                    className="border-gray-700 text-black hover:bg-gray-800"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    가입하기
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-gray-400 text-sm">또는</span>
          </div>
          
          <div className="auth-wrapper flex justify-center w-full login-btn">
            <GoogleOAuthProvider clientId={googleClientId}>
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
              />
              <button className="flex justify-center items-center gap-2 bg-gray-300 text-gray-900 py-3 px-4 rounded-md w-full">
                <FcGoogle className="w-5 h-5" />
                <span className="text-sm">Google Login</span>
              </button>
            </GoogleOAuthProvider>
          </div>

          <div className="auth-wrapper flex justify-center w-full kakao-login-btn mt-2">
            <button 
              className="flex justify-center items-center gap-2 bg-[#FEE500] text-gray-900 py-3 px-4 rounded-md w-full"
              onClick={handleKakaoLoginClick} 
            >
              <SiKakaotalk className="w-5 h-5" />
              <span className="text-sm">카카오 로그인</span>
            </button>
          </div>

          <div className="auth-wrapper flex justify-center w-full kakao-login-btn mt-2">
            <button 
              className="flex justify-center items-center gap-2 bg-green-300 text-gray-900 py-3 px-4 rounded-md w-full"
              onClick={naverLogin} 
            > 
              <span className="text-sm">네이버 로그인</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
 