import UrlParser from '../routes/url-parser';
import routes from '../routes/routes';
import UserSession from '../utils/user-session';
import TransitionManager from '../utils/transition-manager';
import NotificationHelper from '../utils/notification-helper';

class App {
  constructor({ header, nav, content, footer }) {
    this._header = header; // Elemen <header>
    this._nav = nav;       // Elemen <nav id="main-navigation">
    this._content = content; // Elemen <main id="main-content">
    this._footer = footer; // Elemen <footer>
    this._currentPage = null;

    this._initialAppShell();
    this._updateLoginStatusUI(); // Panggil saat inisialisasi untuk setup awal UI
  }

  _initialAppShell() {
    console.log('App shell initialized.');
    // Setup event listener untuk tombol hamburger
    const hamburgerButton = this._header.querySelector('.hamburger-button');
    const navigation = this._nav;

    if (hamburgerButton && navigation) {
      hamburgerButton.addEventListener('click', (event) => {
        event.stopPropagation();
        navigation.classList.toggle('open');
        hamburgerButton.setAttribute('aria-expanded', navigation.classList.contains('open'));
      });

      document.body.addEventListener('click', (event) => {
        if (navigation.classList.contains('open')) {
          if (!navigation.contains(event.target) && !hamburgerButton.contains(event.target)) {
            navigation.classList.remove('open');
            hamburgerButton.setAttribute('aria-expanded', 'false');
          }
        }
      });
      navigation.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          if (navigation.classList.contains('open')) {
            navigation.classList.remove('open');
            hamburgerButton.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }
  }

  _updateLoginStatusUI() {
    const authLink = this._nav.querySelector('#auth-link');
    const homeLink = this._nav.querySelector('#home-link');
    let userInfoContainer = this._nav.querySelector('.user-info-container');

    if (userInfoContainer) {
      userInfoContainer.remove();
    }
    userInfoContainer = document.createElement('li');
    userInfoContainer.className = 'user-info-container';


    if (UserSession.isUserLoggedIn()) {
      if (homeLink) {
        homeLink.href = '#/feed';
      }
      if (authLink) {
        authLink.textContent = 'Logout';
        authLink.href = '#/logout';
        authLink.onclick = (e) => {
          e.preventDefault();
          UserSession.clearSession();
          NotificationHelper.info('Anda telah logout.');
          this._updateLoginStatusUI();
          window.location.hash = '#/login';
        };
      }
      const userName = UserSession.getUserName();
      if (userName) {
        const userInfoElement = document.createElement('span');
        userInfoElement.className = 'user-info';
        userInfoElement.textContent = `Hi, ${userName}!`;
        userInfoContainer.appendChild(userInfoElement);
      }
      if (authLink && authLink.parentElement) {
        authLink.parentElement.insertAdjacentElement('beforebegin', userInfoContainer);
      }
    } else {
      if (homeLink) {
        homeLink.href = '#/';
      }
      if (authLink) {
        authLink.textContent = 'Login';
        authLink.href = '#/login';
        authLink.onclick = null;
      }
    }
    this._updateActiveNavLink();
  }

  _updateActiveNavLink() {
    let currentHashPath = window.location.hash.slice(1).toLowerCase() || '/';

    if (currentHashPath === '/') {
      currentHashPath = UserSession.isUserLoggedIn() ? '/feed' : '/login';
    } else if (currentHashPath === 'logout') {
      currentHashPath = '/login';
    }

    this._nav.querySelectorAll('ul li a').forEach(link => {
      link.classList.remove('active');
      const linkHrefPathOrigin = link.getAttribute('href');
      let linkHrefPath = linkHrefPathOrigin.startsWith('#') ? linkHrefPathOrigin.slice(1).toLowerCase() || '/' : linkHrefPathOrigin.toLowerCase() || '/';

      let effectiveLinkHrefPath = linkHrefPath;
      if (link.id === 'home-link') { // "Beranda" link
        // Tujuan efektifnya adalah /feed jika login, atau /login jika tidak (untuk halaman root)
        effectiveLinkHrefPath = UserSession.isUserLoggedIn() ? '/feed' : '/login';
      }

      if (effectiveLinkHrefPath === currentHashPath) {
        link.classList.add('active');
      }
    });
  }

  async renderPage() {
    this._updateLoginStatusUI();

    const requestedUrlPath = UrlParser.parseActiveUrlWithCombiner();
    let targetUrlPath = requestedUrlPath;

    // Tentukan pageIdentifier (definisi rute seperti '/story/:id') dari URL yang diminta
    let pageIdentifier = targetUrlPath;
    const parsedUrl = UrlParser.parseActiveUrlWithoutCombiner(targetUrlPath.slice(1)); // parse tanpa '#'
    if (parsedUrl.id && parsedUrl.resource) {
      pageIdentifier = `/${parsedUrl.resource}/:id`; // Ini akan jadi misal '/story/:id'
    }
    // Jika tidak ada parameter, pageIdentifier akan sama dengan targetUrlPath (misal '/feed')

    const isLoggedIn = UserSession.isUserLoggedIn();
    // Gunakan pageIdentifier untuk mencocokkan dengan definisi rute yang diproteksi/khusus tamu
    const protectedRouteDefinitions = ['/feed', '/add-story', '/story/:id'];
    const guestOnlyRouteDefinitions = ['/login', '/register'];

    // Logika Redirect
    if (isLoggedIn) {
      // Jika sudah login dan mencoba akses halaman tamu atau root ('/')
      // Kita menggunakan pageIdentifier dari targetUrlPath awal, karena targetUrlPath bisa berubah
      let initialPageIdentifierForRedirectCheck = requestedUrlPath;
      const initialParsedUrl = UrlParser.parseActiveUrlWithoutCombiner(requestedUrlPath.slice(1));
      if (initialParsedUrl.id && initialParsedUrl.resource) {
        initialPageIdentifierForRedirectCheck = `/${initialParsedUrl.resource}/:id`;
      }

      if (guestOnlyRouteDefinitions.includes(initialPageIdentifierForRedirectCheck) || initialPageIdentifierForRedirectCheck === '/') {
        targetUrlPath = '/feed';
        if (window.location.hash !== `#/feed`) {
          window.location.hash = '#/feed';
          return;
        }
        pageIdentifier = '/feed'; // Update pageIdentifier juga karena target berubah
      }
    } else {
      // Jika belum login dan mencoba akses halaman terproteksi
      if (protectedRouteDefinitions.includes(pageIdentifier)) {
        NotificationHelper.info('Anda harus login untuk mengakses halaman ini.');
        targetUrlPath = '/login';
        if (window.location.hash !== `#/login`) {
          window.location.hash = '#/login';
          return;
        }
        pageIdentifier = '/login'; // Update pageIdentifier juga
      }
    }

    const pageToRender = routes[pageIdentifier] || routes['/404'];

    const navigationAction = async () => {
      if (this._currentPage && typeof this._currentPage.beforeLeave === 'function') {
        await this._currentPage.beforeLeave();
      }

      this._content.innerHTML = await pageToRender.render();

      if (typeof pageToRender.afterRender === 'function') {
        await pageToRender.afterRender(this._content);
      }
      this._currentPage = pageToRender;

      window.scrollTo(0, 0);

      const mainContent = document.querySelector('#main-content');
      if (mainContent) {
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
      }
      this._updateActiveNavLink();
    };

    if (document.startViewTransition && this._currentPage !== pageToRender) {
      TransitionManager.handlePageTransition(navigationAction);
    } else {
      await navigationAction();
    }
  }
}

export default App;
