const USER_TOKEN_KEY = 'USER_TOKEN_STARTER_PROJECT';
const USER_NAME_KEY = 'USER_NAME_STARTER_PROJECT';

const UserSession = {
  setUserToken(token) {
    localStorage.setItem(USER_TOKEN_KEY, token);
  },

  getUserToken() {
    return localStorage.getItem(USER_TOKEN_KEY);
  },

  removeUserToken() {
    localStorage.removeItem(USER_TOKEN_KEY);
  },

  setUserName(name) {
    localStorage.setItem(USER_NAME_KEY, name);
  },

  getUserName() {
    return localStorage.getItem(USER_NAME_KEY);
  },

  removeUserName() {
    localStorage.removeItem(USER_NAME_KEY);
  },

  clearSession() {
    this.removeUserToken();
    this.removeUserName();
    // Tambahkan item lain yang perlu dihapus dari localStorage/sessionStorage
  },

  isUserLoggedIn() {
    return !!this.getUserToken();
  },
};

export default UserSession;
