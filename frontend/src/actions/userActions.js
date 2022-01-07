import axios from "axios";
import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    REGISTER_REQUEST,
    UPDATE_REQUEST,
    UPDATE_SUCCESS,
    UPDATE_FAIL,
    DELETE_REQUEST,
    DELETE_SUCCESS,
    DELETE_FAIL
} from "./types";

export const registerAction = (userInfo) => async (dispatch) => {
    //inizia la richiesta di registrazione
    dispatch({ type: REGISTER_REQUEST, payload: {} });

    try {
        const { data } = await axios.post("/api/auth/register", userInfo);

        dispatch({
            type: REGISTER_SUCCESS,
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: REGISTER_FAIL,
            payload: error.response.data.error,
        });
    }
};

export const loginAction = (email, password) => async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST, payload: {} });

    try {
        const { data } = await axios.post("/api/auth/login", {
            email,
            password,
        });

        dispatch({
            type: LOGIN_SUCCESS,
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: LOGIN_FAIL,
            payload: error.response.data.error,
        });
    }
};

export const updateAction = (userInfo, userId, token) => async (dispatch) => {
    //inizia la richiesta di update
    dispatch({ type: UPDATE_REQUEST, payload: {} });
  
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.put(`/api/users/${userId}${userInfo.passwordOld ? "?password=true" :''}`, userInfo, config);

  
      dispatch({ type: UPDATE_SUCCESS, payload: data.data });
  
      return Promise.resolve();
    } catch (error) {
      dispatch({
        type: UPDATE_FAIL,
        payload: error.response.data.error,
      });

      return Promise.reject();
    }
  };

  export const deleteAction = (userId, token) => async (dispatch) => {
    //inizia la richiesta di update
    dispatch({ type: DELETE_REQUEST, payload: {} });
  
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      await axios.delete(`/api/users/${userId}`, config);

      dispatch({ type: DELETE_SUCCESS });
  
      return Promise.resolve();
    } catch (error) {
      dispatch({
        type: DELETE_FAIL,
        payload: error.response.data.error,
      });

      return Promise.reject();
    }
  };
