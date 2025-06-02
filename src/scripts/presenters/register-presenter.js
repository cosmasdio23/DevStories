class RegisterPresenter {
  constructor({ view, authApiService }) {
    this._view = view;
    this._authApiService = authApiService;
  }

  async registerUser({ name, email, password }) {
    this._view.showLoading();
    try {
      const response = await this._authApiService.register({ name, email, password });
      if (!response.error) {
        this._view.displaySuccess('Registrasi berhasil! Silakan login.');
      } else {
        this._view.displayError(response.message || 'Registrasi gagal.');
      }
    } catch (error) {
      console.error('Register Presenter Error:', error);
      this._view.displayError('Terjadi kesalahan pada sistem. Coba lagi nanti.');
    } finally {
      this._view.hideLoading();
    }
  }
}

export default RegisterPresenter;
