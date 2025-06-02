const UrlParser = {
  parseActiveUrlWithCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    const splittedUrl = this._urlSplitter(url);
    return this._urlCombiner(splittedUrl);
  },

  parseActiveUrlWithoutCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    return this._urlSplitter(url);
  },

  _urlSplitter(url) {
    const urlsSplits = url.split('/');
    return {
      resource: urlsSplits[1] || null,
      id: urlsSplits[2] || null,
      verb: urlsSplits[3] || null,
    };
  },

  _urlCombiner(splittedUrl) {
    let combined = '/';
    if (splittedUrl.resource) {
      combined += splittedUrl.resource;
    }
    if (splittedUrl.id) {
      combined += '/:id'; // Gunakan placeholder :id untuk pencocokan rute
    }
    if (splittedUrl.verb) {
      combined += `/${splittedUrl.verb}`;
    }
    return combined.replace('//', '/'); // Menghindari double slash jika resource null
  },
};

export default UrlParser;
