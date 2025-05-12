// src/redux/reducers/connectionReducer.js
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
  ACCEPT_CONNECTION_SUCCESS,
  REJECT_CONNECTION_SUCCESS,
} from "../actions/connectionTypes";

const initialState = {
  searchResults: [],
  connections: [],
  loading: false,
  searchLoading: false,
  addingConnection: false,
  error: null,
  searchError: null,
  addConnectionError: null,
};

const connectionReducer = (state = initialState, action) => {
  switch (action.type) {
    // Search users cases
    case SEARCH_USERS_REQUEST:
      return {
        ...state,
        searchLoading: true,
        searchError: null,
      };

    case SEARCH_USERS_SUCCESS:
      return {
        ...state,
        searchResults: action.payload,
        searchLoading: false,
        searchError: null,
      };

    case SEARCH_USERS_FAILURE:
      return {
        ...state,
        searchLoading: false,
        searchError: action.payload,
      };

    // Add connection cases
    case ADD_CONNECTION_REQUEST:
      return {
        ...state,
        addingConnection: true,
        addConnectionError: null,
      };

    case ADD_CONNECTION_SUCCESS:
      return {
        ...state,
        connections: [...state.connections, action.payload],
        addingConnection: false,
        addConnectionError: null,
        // Clear search results after successfully adding a connection
        searchResults: [],
      };

    case ADD_CONNECTION_FAILURE:
      return {
        ...state,
        addingConnection: false,
        addConnectionError: action.payload,
      };

    // Fetch connections cases
    case FETCH_CONNECTIONS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_CONNECTIONS_SUCCESS:
      return {
        ...state,
        connections: action.payload,
        loading: false,
        error: null,
      };

    case FETCH_CONNECTIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Handle connection responses
    case ACCEPT_CONNECTION_SUCCESS:
      return {
        ...state,
        connections: state.connections.map((conn) =>
          conn.id === action.payload.id ? { ...conn, status: "active" } : conn
        ),
      };

    case REJECT_CONNECTION_SUCCESS:
      return {
        ...state,
        connections: state.connections.map((conn) =>
          conn.id === action.payload.id ? { ...conn, status: "rejected" } : conn
        ),
      };

    default:
      return state;
  }
};

export default connectionReducer;
