import API_ENDPOINT from '../globals/api-endpoint';

class StoryApiService {
  static async getAllStories(token) {
    try {
      const response = await fetch(API_ENDPOINT.STORIES, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const responseJson = await response.json();
      if (responseJson.error) {
        console.error('API Error (getAllStories):', responseJson.message);
        return { error: true, message: responseJson.message, listStory: [] };
      }
      return responseJson; // Seharusnya berisi { error: false, message: 'Stories fetched successfully', listStory: [...] }
    } catch (error) {
      console.error('Network/Fetch Error (getAllStories):', error);
      return { error: true, message: error.message || 'Gagal mengambil data cerita.', listStory: [] };
    }
  }

  // Fungsi untuk mengambil cerita tamu jika API mendukung dan tidak butuh token
  static async getAllStoriesGuest() {
    try {
      const response = await fetch(API_ENDPOINT.STORIES_GUEST); // Asumsi endpoint ini ada
      const responseJson = await response.json();
      if (responseJson.error) {
        console.error('API Error (getAllStoriesGuest):', responseJson.message);
        return { error: true, message: responseJson.message, listStory: [] };
      }
      return responseJson;
    } catch (error) {
      console.error('Network/Fetch Error (getAllStoriesGuest):', error);
      return { error: true, message: error.message || 'Gagal mengambil data cerita tamu.', listStory: [] };
    }
  }

  static async getStoryDetail(id, token) {
    try {
      const response = await fetch(API_ENDPOINT.DETAIL_STORY(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const responseJson = await response.json();
      if (responseJson.error) {
        console.error('API Error (getStoryDetail):', responseJson.message);
        return { error: true, message: responseJson.message, story: null };
      }
      return responseJson; // Seharusnya berisi { error: false, message: 'Story fetched successfully', story: {...} }
    } catch (error)
    {
      console.error('Network/Fetch Error (getStoryDetail):', error);
      return { error: true, message: error.message || 'Gagal mengambil detail cerita.', story: null };
    }
  }

  static async addStory(formData, token) {
    try {
      const response = await fetch(API_ENDPOINT.ADD_STORY, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' tidak perlu diset manual untuk FormData, browser akan otomatis.
        },
        body: formData,
      });
      const responseJson = await response.json();
      if (responseJson.error) {
        console.error('API Error (addStory):', responseJson.message);
        return { error: true, message: responseJson.message };
      }
      return responseJson; // Seharusnya berisi { error: false, message: 'Story created successfully' }
    } catch (error) {
      console.error('Network/Fetch Error (addStory):', error);
      return { error: true, message: error.message || 'Gagal menambah cerita.' };
    }
  }
}

export default StoryApiService;
