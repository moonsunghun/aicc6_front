import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchPostNaverLogin } from '../../redux/slices/apiSlice';
import { login } from '../../redux/slices/authSlice';



const NaverCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
 
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    // const storedState = localStorage.getItem('naverState'); // 필요시 state 검증 로직 추가

    // 네이버로부터 code와 state를 정상적으로 받았다면 백엔드 호출
    if (code && state) { // && state === storedState) { // state 검증 조건 포함 (주석 처리)
      console.log('네이버 인가 코드 수신:', code, '상태:', state);
      // localStorage.removeItem('naverState'); // 사용한 state 제거 (필요시)

      // 백엔드에 인가 코드와 state 전송하여 로그인 처리 요청
      dispatch(fetchPostNaverLogin({ code, state }))
        .unwrap()
        .then(response => {
          // 백엔드 응답 처리 (로그인 성공, 사용자 정보 저장 등)
          console.log('네이버 로그인 백엔드 처리 결과:', response);
          // 백엔드에서 받은 사용자 정보로 authData 생성
          const authData = {
            id: response.id,
            user_nm: response.user_nm,
            acc_type: response.acc_type,
            acc_key: response.acc_key,
            name: response.user_nm,
          };
          dispatch(login({ authData })); // Redux 상태 업데이트
          toast.success('네이버 로그인 성공!');
          navigate('/'); // 홈으로 이동
        })
        .catch(error => {
          console.error('네이버 로그인 백엔드 처리 중 오류 발생:', error);
          toast.error(error.message || '네이버 로그인 처리 중 오류가 발생했습니다.');
          navigate('/'); // 오류 발생 시 홈으로 이동 또는 오류 페이지로 이동
        });
    } else {
      // 인가 코드나 state를 받지 못한 경우 (예: 사용자가 로그인 취소 또는 오류)
      console.error('네이버 인가 코드 또는 state 누락');
      toast.error('네이버 로그인 처리 중 오류가 발생했습니다.'); // 사용자가 취소한 경우 메시지 변경 고려
      navigate('/'); // 홈으로 이동
    }
  }, [location, navigate, dispatch]);

  return (
    <div>
      네이버 로그인 처리 중...
    </div>
  );
};

export default NaverCallback; 