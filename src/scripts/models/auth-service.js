import API_ENDPOINT from '../globals/api-endpoint';

class AuthApiService {
  static async login({ email, password }) {
    try {
      const response = await fetch(API_ENDPOINT.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const responseJson = await response.json();
      if (responseJson.error) {
        console.error('API Error (login):', responseJson.message);
        return { error: true, message: responseJson.message, loginResult: null };
      }
      return responseJson; // Seharusnya berisi { error: false, message: 'success', loginResult: {...} }
    } catch (error) {
      console.error('Network/Fetch Error (login):', error);
      return { error: true, message: error.message || 'Gagal melakukan login.', loginResult: null };
    }
  }

  static async register({ name, email, password }) {
    try {
      const response = await fetch(API_ENDPOINT.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      const responseJson = await response.json();
      if (responseJson.error) {
        console.error('API Error (register):', responseJson.message);
        return { error: true, message: responseJson.message };
      }
      return responseJson; // Seharusnya berisi { error: false, message: 'User Created' }
    } catch (error) {
      console.error('Network/Fetch Error (register):', error);
      return { error: true, message: error.message || 'Gagal melakukan registrasi.' };
    }
  }
}

export default AuthApiService;
