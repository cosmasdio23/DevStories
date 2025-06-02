import CONFIG from './config';

const API_ENDPOINT = {
  STORIES: `${CONFIG.BASE_URL}stories`,
  STORIES_GUEST: `${CONFIG.BASE_URL}stories/guest`,
  ADD_STORY: `${CONFIG.BASE_URL}stories`,
  LOGIN: `${CONFIG.BASE_URL}login`,
  REGISTER: `${CONFIG.BASE_URL}register`,
  DETAIL_STORY: (id) => `${CONFIG.BASE_URL}stories/${id}`,
};

export default API_ENDPOINT;
