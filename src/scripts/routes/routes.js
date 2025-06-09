import LoginPage from '../views/pages/login-page';
import RegisterPage from '../views/pages/register-page';
import FeedPage from '../views/pages/feed-page';
import AddStoryPage from '../views/pages/add-story-page';
import DetailStoryPage from '../views/pages/detail-story-page';
import NotFoundPage from '../views/pages/not-found-page';
import SavedStoriesPage from '../views/pages/saved-stories-page';

const routes = {
  '/': LoginPage,
  '/login': LoginPage,
  '/register': RegisterPage,
  '/feed': FeedPage,
  '/saved': SavedStoriesPage,
  '/add-story': AddStoryPage,
  '/story/:id': DetailStoryPage,
  '/404': NotFoundPage,
};

export default routes;
