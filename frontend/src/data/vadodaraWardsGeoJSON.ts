// GeoJSON Polygon Boundary Dataset for Vadodara Municipal Corporation (10 VMC Wards)
// RFC 7946 Standard FeatureCollection

export interface WardFeatureProperties {
  id: number;
  ward_number: number;
  name: string;
  name_gu: string;
  name_hi: string;
  zone: 'Central' | 'West' | 'North' | 'South' | 'East';
  centroid_lat: number;
  centroid_lng: number;
  population: number;
  area_sq_km: number;
  color: string;
}

export interface WardGeoJSONFeature {
  type: 'Feature';
  id: number;
  properties: WardFeatureProperties;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][]; // [lng, lat] format
  };
}

export interface WardGeoJSONCollection {
  type: 'FeatureCollection';
  features: WardGeoJSONFeature[];
}

export const VADODARA_WARDS_GEOJSON: WardGeoJSONCollection = {
  type: 'FeatureCollection',
  features: [
    // Ward 1: Sayajigunj (Central Zone)
    {
      type: 'Feature',
      id: 1,
      properties: {
        id: 1,
        ward_number: 1,
        name: 'Ward 1 — Sayajigunj',
        name_gu: 'વોર્ડ ૧ — સયાજીગંજ',
        name_hi: 'वार्ड १ — सयाजीगंज',
        zone: 'Central',
        centroid_lat: 22.3112,
        centroid_lng: 73.1878,
        population: 185000,
        area_sq_km: 12.4,
        color: '#0284C7',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.175, 22.302],
            [73.198, 22.304],
            [73.199, 22.318],
            [73.182, 22.322],
            [73.172, 22.315],
            [73.175, 22.302],
          ],
        ],
      },
    },

    // Ward 2: Akota (West Zone)
    {
      type: 'Feature',
      id: 2,
      properties: {
        id: 2,
        ward_number: 2,
        name: 'Ward 2 — Akota',
        name_gu: 'વોર્ડ ૨ — અકોટા',
        name_hi: 'वार्ड २ — अकोटा',
        zone: 'West',
        centroid_lat: 22.2981,
        centroid_lng: 73.1642,
        population: 195000,
        area_sq_km: 14.8,
        color: '#2563EB',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.151, 22.285],
            [73.175, 22.288],
            [73.178, 22.308],
            [73.155, 22.312],
            [73.148, 22.298],
            [73.151, 22.285],
          ],
        ],
      },
    },

    // Ward 3: Raopura (Central Zone)
    {
      type: 'Feature',
      id: 3,
      properties: {
        id: 3,
        ward_number: 3,
        name: 'Ward 3 — Raopura',
        name_gu: 'વોર્ડ ૩ — રાવપુરા',
        name_hi: 'वार्ड ३ — रावपुरा',
        zone: 'Central',
        centroid_lat: 22.3025,
        centroid_lng: 73.2054,
        population: 172000,
        area_sq_km: 10.2,
        color: '#D97706',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.195, 22.292],
            [73.218, 22.295],
            [73.219, 22.312],
            [73.198, 22.314],
            [73.192, 22.302],
            [73.195, 22.292],
          ],
        ],
      },
    },

    // Ward 4: Karelibaug (North Zone)
    {
      type: 'Feature',
      id: 4,
      properties: {
        id: 4,
        ward_number: 4,
        name: 'Ward 4 — Karelibaug',
        name_gu: 'વોર્ડ ૪ — કારેલીબાગ',
        name_hi: 'वार्ड ४ — कारेलीबाग',
        zone: 'North',
        centroid_lat: 22.3214,
        centroid_lng: 73.1989,
        population: 210000,
        area_sq_km: 16.5,
        color: '#DC2626',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.188, 22.316],
            [73.215, 22.318],
            [73.218, 22.338],
            [73.192, 22.342],
            [73.184, 22.328],
            [73.188, 22.316],
          ],
        ],
      },
    },

    // Ward 5: Fatehgunj (North Zone)
    {
      type: 'Feature',
      id: 5,
      properties: {
        id: 5,
        ward_number: 5,
        name: 'Ward 5 — Fatehgunj',
        name_gu: 'વોર્ડ ૫ — ફતેહગંજ',
        name_hi: 'वार्ड ५ — फतेहगंज',
        zone: 'North',
        centroid_lat: 22.3168,
        centroid_lng: 73.1895,
        population: 168000,
        area_sq_km: 11.8,
        color: '#059669',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.178, 22.314],
            [73.195, 22.315],
            [73.198, 22.332],
            [73.179, 22.335],
            [73.172, 22.324],
            [73.178, 22.314],
          ],
        ],
      },
    },

    // Ward 6: Manjalpur (South Zone)
    {
      type: 'Feature',
      id: 6,
      properties: {
        id: 6,
        ward_number: 6,
        name: 'Ward 6 — Manjalpur',
        name_gu: 'વોર્ડ ૬ — માંજલપુર',
        name_hi: 'वार्ड ६ — मांजलपुर',
        zone: 'South',
        centroid_lat: 22.2684,
        centroid_lng: 73.1956,
        population: 225000,
        area_sq_km: 18.2,
        color: '#7C3AED',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.182, 22.252],
            [73.212, 22.256],
            [73.215, 22.282],
            [73.185, 22.285],
            [73.178, 22.268],
            [73.182, 22.252],
          ],
        ],
      },
    },

    // Ward 7: Makarpura (South Zone)
    {
      type: 'Feature',
      id: 7,
      properties: {
        id: 7,
        ward_number: 7,
        name: 'Ward 7 — Makarpura',
        name_gu: 'વોર્ડ ૭ — મકરપુરા',
        name_hi: 'वार्ड ७ — मकरपुरा',
        zone: 'South',
        centroid_lat: 22.2512,
        centroid_lng: 73.1923,
        population: 198000,
        area_sq_km: 22.4,
        color: '#4F46E5',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.172, 22.232],
            [73.215, 22.235],
            [73.218, 22.258],
            [73.182, 22.255],
            [73.168, 22.245],
            [73.172, 22.232],
          ],
        ],
      },
    },

    // Ward 8: Gotri (West Zone)
    {
      type: 'Feature',
      id: 8,
      properties: {
        id: 8,
        ward_number: 8,
        name: 'Ward 8 — Gotri',
        name_gu: 'વોર્ડ ૮ — ગોત્રી',
        name_hi: 'वार्ड ८ — गोत्री',
        zone: 'West',
        centroid_lat: 22.3125,
        centroid_lng: 73.1412,
        population: 205000,
        area_sq_km: 19.1,
        color: '#0891B2',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.125, 22.298],
            [73.155, 22.302],
            [73.158, 22.328],
            [73.132, 22.332],
            [73.121, 22.315],
            [73.125, 22.298],
          ],
        ],
      },
    },

    // Ward 9: Gorwa (North-West Zone)
    {
      type: 'Feature',
      id: 9,
      properties: {
        id: 9,
        ward_number: 9,
        name: 'Ward 9 — Gorwa',
        name_gu: 'વોર્ડ ૯ — ગોરવા',
        name_hi: 'वार्ड ९ — गोरवा',
        zone: 'North',
        centroid_lat: 22.3341,
        centroid_lng: 73.1624,
        population: 182000,
        area_sq_km: 15.6,
        color: '#EA580C',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.145, 22.322],
            [73.178, 22.325],
            [73.179, 22.352],
            [73.152, 22.355],
            [73.141, 22.338],
            [73.145, 22.322],
          ],
        ],
      },
    },

    // Ward 10: Waghodia Road (East Zone)
    {
      type: 'Feature',
      id: 10,
      properties: {
        id: 10,
        ward_number: 10,
        name: 'Ward 10 — Waghodia Road',
        name_gu: 'વોર્ડ ૧૦ — વાઘોડિયા રોડ',
        name_hi: 'वार्ड १० — वाघोडिया रोड',
        zone: 'East',
        centroid_lat: 22.2987,
        centroid_lng: 73.2341,
        population: 215000,
        area_sq_km: 21.0,
        color: '#9333EA',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.218, 22.282],
            [73.255, 22.288],
            [73.258, 22.318],
            [73.222, 22.322],
            [73.214, 22.302],
            [73.218, 22.282],
          ],
        ],
      },
    },
  ],
};
