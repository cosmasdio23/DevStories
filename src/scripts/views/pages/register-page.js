import AuthApiService from '../../models/auth-service';
// import RegisterPresenter from '../../presenters/register-presenter'; // Pakai yang sudah dibuat

const RegisterPage = {
  async render() {
    return `
      <div class="register-container auth-container">
        <h2>Registrasi Akun Baru</h2>
        <form id="registerForm">
          <div class="form-group">
            <label for="registerName">Nama:</label>
            <input type="text" id="registerName" name="name" required minlength="3">
          </div>
          <div class="form-group">
            <label for="registerEmail">Email:</label>
            <input type="email" id="registerEmail" name="email" required>
          </div>
          <div class="form-group">
            <label for="registerPassword">Password:</label>
            <input type="password" id="registerPassword" name="password" required minlength="8">
          </div>
          <button type="submit" id="registerButton" class="button button-primary">Register</button>
        </form>
        <p id="register-message" class="message"></p>
        <p>Sudah punya akun? <a href="#/login">Login di sini</a>.</p>
      </div>
    `;
  },

  async afterRender() {
    const registerForm = document.querySelector('#registerForm');
    const messageElement = document.querySelector('#register-message');
    // const registerButton = document.querySelector('#registerButton'); // Untuk disable saat loading

    // Kita akan gunakan RegisterPresenter
    // const presenter = new RegisterPresenter({ view: this, authApiService: AuthApiService });

    if (registerForm) {
      registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        messageElement.textContent = ''; // Hapus pesan sebelumnya
        // registerButton.disabled = true; // Nonaktifkan tombol selama proses

        const name = event.target.elements.name.value;
        const email = event.target.elements.email.value;
        const password = event.target.elements.password.value;

        console.log('Attempting registration with:', { name, email, password });
        try {
          // Langsung panggil service dulu, nanti pindah ke presenter
          const response = await AuthApiService.register({ name, email, password });
          if (!response.error) {
            messageElement.textContent = 'Registrasi berhasil! Silakan login.';
            messageElement.className = 'message success-message'; // Ganti kelas untuk styling
            registerForm.reset();
            // Otomatis redirect ke login setelah beberapa detik
            setTimeout(() => {
              window.location.hash = '#/login';
            }, 2000);
          } else {
            messageElement.textContent = response.message || 'Registrasi gagal.';
            messageElement.className = 'message error-message';
          }
        } catch (error) {
          console.error('Register error:', error);
          messageElement.textContent = 'Terjadi kesalahan saat mencoba registrasi.';
          messageElement.className = 'message error-message';
        } finally {
          // registerButton.disabled = false;
        }
      });
    }
    console.log('RegisterPage rendered');
  },

  // Metode untuk presenter (akan kita gunakan nanti)
  // showLoading() {
  //   const registerButton = document.querySelector('#registerButton');
  //   if (registerButton) registerButton.disabled = true;
  //   // Tampilkan indikator loading jika ada
  // },
  // hideLoading() {
  //   const registerButton = document.querySelector('#registerButton');
  //   if (registerButton) registerButton.disabled = false;
  // },
  // displaySuccess(message) {
  //   const messageElement = document.querySelector('#register-message');
  //   messageElement.textContent = message;
  //   messageElement.className = 'message success-message';
  //   document.querySelector('#registerForm').reset();
  //   setTimeout(() => { window.location.hash = '#/login'; }, 2000);
  // },
  // displayError(message) {
  //   const messageElement = document.querySelector('#register-message');
  //   messageElement.textContent = message;
  //   messageElement.className = 'message error-message';
  // },
};

export default RegisterPage;
