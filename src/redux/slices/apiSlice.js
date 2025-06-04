import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { GET_TASKS_API_URL, UPDATE_COMPLETED_TASK_API_URL, UPDATE_IMPORTANT_TASK_API_URL, POST_TASK_API_URL, DELETE_TASK_API_URL, POST_ACCOUNT_API_URL, POST_CREATE_ACCOUNT_API_URL, POST_LOGIN_API_URL, POST_KAKAO_LOGIN_API_URL, POST_NAVER_LOGIN_API_URL } from '../../utils/apiUrl';
import { getRequest, patchRequest, postRequest, deleteRequest } from '../../utils/requests'; 

const getItemsFetchThunk = (actionType, apiUrl) => {
  return createAsyncThunk(actionType, async (userId) => {
    // console.log(apiUrl, userId);
    const fullPath = `${apiUrl}/${userId}`; // http://localhost:8000/get_task/118325483071000080626
    return await getRequest(fullPath);
  });
};

export const updateCompletedFetchThunk = (actionType, apiUrl) => {
  return createAsyncThunk(actionType, async (options) => { 
    console.log(options)
    return await patchRequest(apiUrl, options);
  });
};

export const fetchGetItems = getItemsFetchThunk(
  'fetchGetItems',
  GET_TASKS_API_URL
);

export const fetchUpdateCompleted = updateCompletedFetchThunk(
  'fetchUpdateCompleted',
  UPDATE_COMPLETED_TASK_API_URL
);

export const fetchPostTask = createAsyncThunk(
  'fetchPostTask',
  async (taskData) => {
    return await postRequest(POST_TASK_API_URL, {
      body: JSON.stringify(taskData),
    });
  }
);

export const fetchDeleteTask = createAsyncThunk(
  'fetchDeleteTask',
  async (taskId) => {
    return await deleteRequest(`${DELETE_TASK_API_URL}/${taskId}`);
  }
);

export const fetchPostAccount = createAsyncThunk(
  'fetchPostAccount',
  async (accountData) => {
    return await postRequest(POST_ACCOUNT_API_URL, {
      body: JSON.stringify(accountData),
    });
  }
);

export const fetchPostCreateAccount = createAsyncThunk(
  'fetchPostCreateAccount',
  async (accountData) => {
    const response = await postRequest(POST_CREATE_ACCOUNT_API_URL, {
      body: JSON.stringify(accountData),
    });
    if (!response.success) {
      throw new Error(response.msg || 'Account creation failed');
    }
    return response;
  }
);

export const fetchPostLogin = createAsyncThunk(
  'fetchPostLogin',
  async (accountData) => {
    return await postRequest(POST_LOGIN_API_URL, {
      body: JSON.stringify(accountData),
    });
  }
);

export const fetchPostKakaoLogin = createAsyncThunk(
  'fetchPostKakaoLogin',
  async (code, { rejectWithValue }) => {
    try {
      const response = await postRequest(POST_KAKAO_LOGIN_API_URL, {
        body: JSON.stringify({ code }),
      });

      if (!response.success) {
        // 백엔드에서 success: false로 응답하는 경우
        return rejectWithValue(response.msg || '카카오 로그인 처리 실패');
      }

      return response.data; // 성공 시 사용자 정보 반환

    } catch (error) {
      console.error('Error during Kakao login API call:', error);
      // API 호출 자체에서 에러가 발생한 경우
      return rejectWithValue(error.message || '카카오 로그인 중 오류 발생');
    }
  }
);

export const fetchPostNaverLogin = createAsyncThunk(
  'api/postNaverLogin',
  async ({ code, state }, { rejectWithValue }) => {
    try {
      const response = await postRequest(POST_NAVER_LOGIN_API_URL, {
        body: JSON.stringify({ code, state }),
      });

      if (!response.success) {
        // 백엔드에서 success: false로 응답하는 경우
        return rejectWithValue(response.msg || '네이버 로그인 처리 실패');
      }

      return response.data; // 성공 시 사용자 정보 반환 (백엔드 응답 구조에 따라 조정 필요)

    } catch (error) {
      console.error('Error during Naver login API call:', error);
      // API 호출 자체에서 에러가 발생한 경우 (네트워크 오류, 서버 500 등)
      return rejectWithValue(error.message || '네이버 로그인 중 오류 발생');
    }
  }
);

const handleFulfilled = (stateKey) => (state, action) => {
  state[stateKey] = action.payload;
};

const handleRejected = (action) => {
  console.log('Error' + action.payload);
};

const apiSlice = createSlice({
  name: 'api',
  initialState: {
    getItemsData: null,
    updateCompletedData: null,
    postTaskData: null,
    deleteTaskData: null,
    postAccountData: null,
    postCreateAccountData: null,
    postLoginData: null,
    postKakaoLoginData: null,
    postNaverLoginData: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGetItems.fulfilled, handleFulfilled('getItemsData'))
      .addCase(fetchGetItems.rejected, handleRejected)
      .addCase(fetchUpdateCompleted.fulfilled, handleFulfilled('updateCompletedData'))
      .addCase(fetchUpdateCompleted.rejected, handleRejected)
      .addCase(fetchPostTask.fulfilled, handleFulfilled('postTaskData'))
      .addCase(fetchPostTask.rejected, handleRejected)
      .addCase(fetchDeleteTask.fulfilled, handleFulfilled('deleteTaskData'))
      .addCase(fetchDeleteTask.rejected, handleRejected)
      .addCase(fetchPostAccount.fulfilled, handleFulfilled('postAccountData'))
      .addCase(fetchPostAccount.rejected, handleRejected)
      .addCase(fetchPostCreateAccount.fulfilled, handleFulfilled('postCreateAccountData'))
      .addCase(fetchPostCreateAccount.rejected, handleRejected)
      .addCase(fetchPostLogin.fulfilled, handleFulfilled('postLoginData'))
      .addCase(fetchPostLogin.rejected, handleRejected)
      .addCase(fetchPostKakaoLogin.fulfilled, (state, action) => {
        state.postKakaoLoginData = action.payload; 
        console.log('fetchPostKakaoLogin fulfilled', action.payload);
      })
      .addCase(fetchPostKakaoLogin.rejected, (state, action) => { 
        console.error('fetchPostKakaoLogin rejected', action.payload); 
      })
      .addCase(fetchPostNaverLogin.fulfilled, (state, action) => {
        state.postNaverLoginData = action.payload;
        console.log('fetchPostNaverLogin fulfilled', action.payload);
      })
      .addCase(fetchPostNaverLogin.rejected, (state, action) => {
        console.error('fetchPostNaverLogin rejected', action.payload);
      });
  },
});

export default apiSlice.reducer;
