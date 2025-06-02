import LoginPresenter from '../../presenters/login-presenter';
// AuthApiService dan UserSession akan diurus oleh Presenter
// import AuthApiService from '../../models/auth-service';
// import UserSession from '../../utils/user-session';

const LoginPage = {
  _presenter: null,

  async render() {
    // Inisialisasi presenter di sini atau di afterRender jika perlu akses ke elemen DOM spesifik
    // Untuk saat ini, kita bisa inisialisasi presenter di afterRender setelah elemen form ada
    return `
      <div class="login-container auth-container">
        <h2>Login</h2>
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit" id="loginButton" class="button button-primary">Login</button>
        </form>
        <p id="login-message" class="message"></p>
        <p>Belum punya akun? <a href="#/register">Register di sini</a>.</p>
      </div>
    `;
  },

  async afterRender() {
    // Inisialisasi presenter dengan view ini
    this._presenter = new LoginPresenter({ view: this }); // AuthApiService akan diimpor di dalam LoginPresenter

    const loginForm = document.querySelector('#loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = event.target.elements.email.value;
        const password = event.target.elements.password.value;

        // Panggil presenter untuk menangani login
        await this._presenter.loginUser({ email, password });
      });
    }
    console.log('LoginPage rendered and presenter initialized.');
  },

  // Metode View yang dipanggil oleh Presenter
  showLoading() {
    const loginButton = document.querySelector('#loginButton');
    const messageElement = document.querySelector('#login-message');
    if (loginButton) loginButton.disabled = true;
    if (messageElement) {
      messageElement.textContent = 'Memproses...';
      messageElement.className = 'message info-message'; // Tambahkan kelas info jika perlu styling beda
    }
  },

  hideLoading() {
    const loginButton = document.querySelector('#loginButton');
    if (loginButton) loginButton.disabled = false;
  },

  displaySuccess(message) {
    const messageElement = document.querySelector('#login-message');
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.className = 'message success-message';
    }
    // Navigasi biasanya ditangani oleh Presenter atau setelah callback sukses
  },

  displayError(message) {
    const messageElement = document.querySelector('#login-message');
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.className = 'message error-message';
    }
  },
};

export default LoginPage;
