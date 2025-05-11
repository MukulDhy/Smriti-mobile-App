// selectors.js
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user || {};
export const selectToken = (state) => state.auth.token || null;
