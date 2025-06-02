const AccessibilityHelper = {
  initSkipToContent(skipLinkSelector = '.skip-link', mainContentSelector = '#main-content') {
    const skipLink = document.querySelector(skipLinkSelector);
    const mainContent = document.querySelector(mainContentSelector);

    if (skipLink && mainContent) {
      skipLink.addEventListener('click', (event) => {
        event.preventDefault();
        mainContent.setAttribute('tabindex', -1); // Pastikan bisa di-fokus
        mainContent.focus();
      });

      // Hapus tabindex ketika elemen kehilangan fokus, agar tidak mengganggu urutan tab alami
      mainContent.addEventListener('blur', () => {
        mainContent.removeAttribute('tabindex');
      });
    }
  },
};

export default AccessibilityHelper;
