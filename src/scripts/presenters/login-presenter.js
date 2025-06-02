import AuthApiService from '../models/auth-service';
import UserSession from '../utils/user-session';

class LoginPresenter {
  constructor({ view }) {
    this._view = view;
    // this._authApiService = AuthApiService; // Contoh. Tidak perlu disimpan jika hanya dipakai sekali
  }

  async loginUser({ email, password }) {
    this._view.showLoading();
    try {
      const response = await AuthApiService.login({ email, password }); // Langsung gunakan
      if (!response.error && response.loginResult) { // Periksa loginResult
        UserSession.setUserToken(response.loginResult.token);
        UserSession.setUserName(response.loginResult.name);
        this._view.displaySuccess('Login berhasil! Mengarahkan ke feed...');

        // Arahkan ke halaman feed setelah login berhasil
        // Tambahkan delay sedikit agar pengguna sempat baca pesan sukses
        setTimeout(() => {
          window.location.hash = '#/feed';
        }, 1000);
      } else {
        this._view.displayError(response.message || 'Login gagal. Periksa kembali email dan password Anda.');
      }
    } catch (error) {
      console.error('Login Presenter Error:', error);
      this._view.displayError('Terjadi kesalahan pada sistem. Coba lagi nanti.');
    } finally {
      this._view.hideLoading();
    }
  }
}

export default LoginPresenter;
