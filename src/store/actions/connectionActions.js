// src/redux/actions/connectionActions.js
import {
  SEARCH_USERS_REQUEST,
  SEARCH_USERS_SUCCESS,
  SEARCH_USERS_FAILURE,
  ADD_CONNECTION_REQUEST,
  ADD_CONNECTION_SUCCESS,
  ADD_CONNECTION_FAILURE,
  FETCH_CONNECTIONS_REQUEST,
  FETCH_CONNECTIONS_SUCCESS,
  FETCH_CONNECTIONS_FAILURE,
} from "../actions/connectionTypes";
import axios from "axios";
import API_BASE_URL from "../../config";
const API_URL = API_BASE_URL;
/**
 * Search for users in the database by query string and user type
 * @param {string} query - The search query (name, email, etc.)
 * @param {string} userType - The type of user to search for ('patient' or 'caregiver')
 * @returns {Function} - Redux thunk function
 */
export const searchUsers = (query, userType) => async (dispatch, getState) => {
  try {
    dispatch({ type: SEARCH_USERS_REQUEST });

    const { auth } = getState();
    const token = auth.token;

    const response = await axios.get(`${API_URL}/users/search`, {
      params: {
        query,
        userType,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({
      type: SEARCH_USERS_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;

    dispatch({
      type: SEARCH_USERS_FAILURE,
      payload: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

/**
 * Add a connection between two users (patient-caregiver relationship)
 * @param {string} userId - ID of the current user
 * @param {string} connectId - ID of the user to connect with
 * @param {string} connectionType - Type of connection ('patient-caregiver' or 'caregiver-patient')
 * @returns {Function} - Redux thunk function
 */
export const addConnection =
  (userId, connectId, connectionType) => async (dispatch, getState) => {
    try {
      dispatch({ type: ADD_CONNECTION_REQUEST });

      const { auth } = getState();
      const token = auth.token;

      const response = await axios.post(
        `${API_URL}/connections/add`,
        {
          userId,
          connectId,
          connectionType,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch({
        type: ADD_CONNECTION_SUCCESS,
        payload: response.data,
      });

      // After establishing connection, update the relevant state
      if (connectionType === "patient-caregiver") {
        // Update caregiver info in state
        dispatch({
          type: "SET_CAREGIVER_DATA",
          payload: response.data.caregiverData,
        });
      } else {
        // Update patient info in state
        dispatch({
          type: "SET_PATIENT_DATA",
          payload: response.data.patientData,
        });
      }

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;

      dispatch({
        type: ADD_CONNECTION_FAILURE,
        payload: errorMessage,
      });

      throw new Error(errorMessage);
    }
  };

/**
 * Fetch all connections for the current user
 * @returns {Function} - Redux thunk function
 */
export const fetchConnections = () => async (dispatch, getState) => {
  try {
    dispatch({ type: FETCH_CONNECTIONS_REQUEST });

    const { auth } = getState();
    const { user, token } = auth;

    const response = await axios.get(`${API_URL}/connections/user/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({
      type: FETCH_CONNECTIONS_SUCCESS,
      payload: response.data,
    });

    // Update relevant state based on user type
    if (user.userType.toLowerCase() === "patient") {
      // Set caregiver data if available
      const caregiverData = response.data.find(
        (conn) =>
          conn.connectionType === "patient-caregiver" &&
          conn.status === "active"
      )?.caregiverData;

      if (caregiverData) {
        dispatch({
          type: "SET_CAREGIVER_DATA",
          payload: caregiverData,
        });
      }
    } else {
      // Set patient data if available
      const patientData = response.data.find(
        (conn) =>
          conn.connectionType === "caregiver-patient" &&
          conn.status === "active"
      )?.patientData;

      if (patientData) {
        dispatch({
          type: "SET_PATIENT_DATA",
          payload: patientData,
        });
      }
    }

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;

    dispatch({
      type: FETCH_CONNECTIONS_FAILURE,
      payload: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

/**
 * Accept a connection request
 * @param {string} connectionId - ID of the connection to accept
 * @returns {Function} - Redux thunk function
 */
export const acceptConnection =
  (connectionId) => async (dispatch, getState) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await axios.put(
        `${API_URL}/connections/${connectionId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh connections after accepting
      dispatch(fetchConnections());

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;

      throw new Error(errorMessage);
    }
  };

/**
 * Reject a connection request
 * @param {string} connectionId - ID of the connection to reject
 * @returns {Function} - Redux thunk function
 */
export const rejectConnection =
  (connectionId) => async (dispatch, getState) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await axios.put(
        `${API_URL}/connections/${connectionId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh connections after rejecting
      dispatch(fetchConnections());

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;

      throw new Error(errorMessage);
    }
  };
