// starter-project/src/scripts/utils/map-helper.js
import L from 'leaflet'; // <-- Uncomment atau tambahkan
import 'leaflet/dist/leaflet.css'; // <-- Uncomment atau tambahkan

// Fix untuk ikon default Leaflet yang mungkin tidak muncul dengan Webpack
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl; // <-- Uncomment atau tambahkan
L.Icon.Default.mergeOptions({ // <-- Uncomment atau tambahkan
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const MapHelper = {
  _maps: {},

  displayStoryMap(mapId, latitude, longitude, storyName) {
    if (typeof L === 'undefined') {
      console.error('Leaflet (L) is not loaded.');
      const mapElement = document.getElementById(mapId);
      if (mapElement) mapElement.innerHTML = 'Peta tidak dapat dimuat (Leaflet error).';
      return;
    }
    if (this._maps[mapId]) {
      try {
        this._maps[mapId].remove();
      } catch (e) {
        console.warn('Error removing previous map instance:', e);
      }
    }

    // Pastikan elemen mapId ada di DOM dan terlihat
    const mapElement = document.getElementById(mapId);
    if (!mapElement || !mapElement.offsetParent) {
      // console.warn(`Map container ${mapId} is not visible or not in DOM. Deferring map initialization.`);
      // // Anda bisa mencoba lagi setelah delay singkat, atau pastikan elemen sudah visible
      // setTimeout(() => this.displayStoryMap(mapId, latitude, longitude, storyName), 100);
      // return;
      // Untuk sekarang, jika tidak visible, tampilkan pesan saja
      if (mapElement) mapElement.innerHTML = 'Menunggu peta...';
      console.warn(`Map container ${mapId} is not visible or not in DOM when trying to initialize.`);
      return;
    }

    // Beri sedikit delay untuk memastikan elemen benar-benar siap jika baru dirender
    // setTimeout(() => {
    try {
      const map = L.map(mapId, { // Nonaktifkan scroll wheel zoom agar tidak mengganggu scroll halaman
        scrollWheelZoom: false,
      }).setView([latitude, longitude], 15);
      this._maps[mapId] = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const marker = L.marker([latitude, longitude]).addTo(map);
      if (storyName) {
        marker.bindPopup(`<b>${storyName}</b>`).openPopup();
      }
      // Invalidate size setelah peta ditambahkan ke DOM dan container visible
      map.invalidateSize();
    } catch (e) {
      console.error(`Error initializing map ${mapId}:`, e);
      if (mapElement) mapElement.innerHTML = 'Gagal memuat peta.';
    }
    // }, 50); // Delay kecil
  },

  // ... (sisa initLocationPicker dan resetPicker tetap sama untuk saat ini)
  initLocationPicker({ mapId, latInput, lonInput, coordsDisplayElement }) {
    if (typeof L === 'undefined') {
      console.error('Leaflet is not loaded.');
      return;
    }
    if (this._maps[mapId]) {
      try {
        this._maps[mapId].remove();
      } catch(e) { console.warn('Error removing map for picker', e); }
    }

    const defaultCoords = [-6.200000, 106.816666]; // Jakarta sebagai default
    let map;
    try {
      map = L.map(mapId, {scrollWheelZoom: false}).setView(defaultCoords, 13);
      this._maps[mapId] = map;
    } catch (e) {
      console.error(`Error initializing picker map ${mapId}:`, e);
      const mapElement = document.getElementById(mapId);
      if (mapElement) mapElement.innerHTML = 'Gagal memuat peta picker.';
      return;
    }

    let pickerMarker;

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
    const stadiaAlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    });

    osmLayer.addTo(map);

    const baseMaps = {
      "OpenStreetMap": osmLayer,
      "Stadia Dark": stadiaAlidadeSmoothDark,
    };
    L.control.layers(baseMaps).addTo(map);

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if(latInput) latInput.value = lat.toFixed(6);
      if(lonInput) lonInput.value = lng.toFixed(6);
      if (coordsDisplayElement) {
        coordsDisplayElement.textContent = `Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`;
      }
      if (pickerMarker) {
        pickerMarker.setLatLng(e.latlng);
      } else {
        pickerMarker = L.marker(e.latlng).addTo(map);
      }
      if (pickerMarker) pickerMarker.bindPopup("Lokasi dipilih").openPopup();
    });
    map.invalidateSize();
  },

  resetPicker(mapId) {
    // ... (implementasi jika perlu)
    console.log(`MapHelper: Reset picker for ${mapId}.`);
  },
};

export default MapHelper;
