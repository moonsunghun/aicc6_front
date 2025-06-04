import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchPostKakaoLogin } from '../../redux/slices/apiSlice';
import { login } from '../../redux/slices/authSlice';

const KakaoCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (code) {
      console.log('카카오 인가 코드:', code);
      // 백엔드에 인가 코드 전송하여 로그인 처리
      dispatch(fetchPostKakaoLogin(code))
        .unwrap()
        .then(response => {
          // 백엔드 응답 처리 (로그인 성공, 사용자 정보 저장 등)
          console.log('카카오 로그인 백엔드 처리 결과:', response);
          // 백엔드에서 받은 사용자 정보로 authData 생성
          const authData = {
            id: response.id, // 백엔드 응답 구조에 따라 수정 필요
            user_nm: response.user_nm, // 백엔드 응답 구조에 따라 수정 필요
            acc_type: response.acc_type, // 백엔드 응답 구조에 따라 수정 필요
            acc_key: response.acc_key, // 백엔드 응답 구조에 따라 수정 필요
            name : response.user_nm,
            // 필요한 다른 사용자 정보도 추가
          };
          dispatch(login({ authData })); // authSlice의 login 액션 디스패치
          toast.success('카카오 로그인 성공!');
          navigate('/'); // 홈 또는 대시보드로 리다이렉트 
        })
        .catch(error => {
          //console.error('카카오 로그인 백엔드 처리 중 오류 발생:', error);
          //toast.error(error.message || '카카오 로그인 처리 중 오류가 발생했습니다.');
          //navigate('/'); // 로그인 페이지로 리다이렉트 또는 에러 페이지
        });

    } else {
      // 인가 코드를 받지 못한 경우 (예: 사용자가 로그인 취소)
      console.error('카카오 인가 코드 누락');
      toast.error('카카오 로그인 취소 또는 오류 발생');
      navigate('/login'); // 로그인 페이지로 리다이렉트
    }
  }, [location, navigate, dispatch]);

  return (
    <div>
      카카오 로그인 처리 중...
    </div>
  );
};

export default KakaoCallback; 