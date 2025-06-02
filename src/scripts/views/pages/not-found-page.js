const NotFoundPage = {
  async render() {
    return `
      <div class="not-found-container">
        <h2>404 - Halaman Tidak Ditemukan</h2>
        <p>Maaf, halaman yang Anda cari tidak ada.</p>
        <a href="#/">Kembali ke Beranda</a>
      </div>
    `;
  },

  async afterRender() {
    console.log('NotFoundPage rendered');
  },
};

export default NotFoundPage;
