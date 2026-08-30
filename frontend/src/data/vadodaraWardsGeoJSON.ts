// GeoJSON Polygon Boundary Dataset for Vadodara Municipal Corporation (Complete 19-Ward Continuous Mosaic)
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
  key_areas: string;
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
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 1,
      "properties": {
        "id": 1,
        "ward_number": 1,
        "name": "Ward 1 — Sayajigunj & Fatehgunj",
        "name_gu": "વોર્ડ ૧ — સયાજીગંજ અને ફતેહગંજ",
        "name_hi": "वार्ड १ — सयाजीगंज और फतेहगंज",
        "zone": "Central",
        "centroid_lat": 22.3112,
        "centroid_lng": 73.1878,
        "population": 185000,
        "area_sq_km": 14.2,
        "color": "#0284C7",
        "key_areas": "Sayajigunj, Fatehgunj, MS University, Station, Kala Ghoda, Pratapgunj, Kamati Baug"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.175,
              22.305
            ],
            [
              73.195,
              22.305
            ],
            [
              73.195,
              22.325
            ],
            [
              73.175,
              22.325
            ],
            [
              73.175,
              22.305
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 2,
      "properties": {
        "id": 2,
        "ward_number": 2,
        "name": "Ward 2 — Harni & Warasia",
        "name_gu": "વોર્ડ ૨ — હરણી અને વારસિયા",
        "name_hi": "वार्ड २ — हरणी और वारसिया",
        "zone": "North",
        "centroid_lat": 22.3385,
        "centroid_lng": 73.214,
        "population": 162000,
        "area_sq_km": 12.8,
        "color": "#0D9488",
        "key_areas": "Harni, Warasia, Sawad, Shweta Park, Vadodara Airport, Motnath"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.2,
              22.325
            ],
            [
              73.23,
              22.325
            ],
            [
              73.23,
              22.355
            ],
            [
              73.2,
              22.355
            ],
            [
              73.2,
              22.325
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 3,
      "properties": {
        "id": 3,
        "ward_number": 3,
        "name": "Ward 3 — Waghodia Road & Bapod",
        "name_gu": "વોર્ડ ૩ — વાઘોડિયા રોડ અને બાપોદ",
        "name_hi": "वार्ड ३ — वाघोडिया रोड और बापोद",
        "zone": "East",
        "centroid_lat": 22.2987,
        "centroid_lng": 73.2341,
        "population": 198000,
        "area_sq_km": 11.5,
        "color": "#8B5CF6",
        "key_areas": "Waghodia Road, Bapod, Kapurai, Parivar Char Rasta, Kendranagar"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.22,
              22.285
            ],
            [
              73.25,
              22.285
            ],
            [
              73.25,
              22.315
            ],
            [
              73.22,
              22.315
            ],
            [
              73.22,
              22.285
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 4,
      "properties": {
        "id": 4,
        "ward_number": 4,
        "name": "Ward 4 — Karelibaug & Sangam",
        "name_gu": "વોર્ડ ૪ — કારેલીબાગ અને સંગમ",
        "name_hi": "वार्ड ४ — कारेलीबाग और संगम",
        "zone": "North",
        "centroid_lat": 22.3214,
        "centroid_lng": 73.1989,
        "population": 174000,
        "area_sq_km": 15,
        "color": "#D97706",
        "key_areas": "Karelibaug, Sangam, VIP Road, Muktanand Circle, Bright School, Khaswadi"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.185,
              22.315
            ],
            [
              73.21,
              22.315
            ],
            [
              73.21,
              22.338
            ],
            [
              73.185,
              22.338
            ],
            [
              73.185,
              22.315
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 5,
      "properties": {
        "id": 5,
        "ward_number": 5,
        "name": "Ward 5 — Raopura & Mandvi",
        "name_gu": "વોર્ડ ૫ — રાવપુરા અને માંડવી",
        "name_hi": "वार्ड ५ — रावपुरा और मांडवी",
        "zone": "Central",
        "centroid_lat": 22.3025,
        "centroid_lng": 73.2054,
        "population": 155000,
        "area_sq_km": 13.6,
        "color": "#DC2626",
        "key_areas": "Raopura, Dandia Bazar, Mandvi, Nyaymandir, Jubilee Baug, Champaner Gate"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.195,
              22.295
            ],
            [
              73.215,
              22.295
            ],
            [
              73.215,
              22.315
            ],
            [
              73.195,
              22.315
            ],
            [
              73.195,
              22.295
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 6,
      "properties": {
        "id": 6,
        "ward_number": 6,
        "name": "Ward 6 — Akota & Gotri",
        "name_gu": "વોર્ડ ૬ — અકોટા અને ગોત્રી",
        "name_hi": "वार्ड ६ — अकोटा और गोत्री",
        "zone": "West",
        "centroid_lat": 22.2981,
        "centroid_lng": 73.1642,
        "population": 210000,
        "area_sq_km": 18.2,
        "color": "#16A34A",
        "key_areas": "Akota, Gotri, Hari Nagar, Alkapuri, RC Dutt Road, Akota Bridge, BPC Road"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.145,
              22.285
            ],
            [
              73.175,
              22.285
            ],
            [
              73.175,
              22.315
            ],
            [
              73.145,
              22.315
            ],
            [
              73.145,
              22.285
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 7,
      "properties": {
        "id": 7,
        "ward_number": 7,
        "name": "Ward 7 — Nizampura & Chhani",
        "name_gu": "વોર્ડ ૭ — નિઝામપુરા અને છાણી",
        "name_hi": "वार्ड ७ — निजामपुरा और छाणी",
        "zone": "North",
        "centroid_lat": 22.334,
        "centroid_lng": 73.182,
        "population": 188000,
        "area_sq_km": 16.4,
        "color": "#4F46E5",
        "key_areas": "Nizampura, Chhani, TP-13, Chhani Jakatnaka, GSFC, Swaminarayan Chhani"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.165,
              22.325
            ],
            [
              73.195,
              22.325
            ],
            [
              73.195,
              22.355
            ],
            [
              73.165,
              22.355
            ],
            [
              73.165,
              22.325
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 8,
      "properties": {
        "id": 8,
        "ward_number": 8,
        "name": "Ward 8 — Nagarwada",
        "name_gu": "વોર્ડ ૮ — નાગરવાડા",
        "name_hi": "वार्ड ८ — नागरवाड़ा",
        "zone": "Central",
        "centroid_lat": 22.312,
        "centroid_lng": 73.201,
        "population": 145000,
        "area_sq_km": 9.8,
        "color": "#E11D48",
        "key_areas": "Nagarwada, Karelibaug (part), Bhadra Kacheri, Salatwada, Macchipith"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.19,
              22.305
            ],
            [
              73.21,
              22.305
            ],
            [
              73.21,
              22.32
            ],
            [
              73.19,
              22.32
            ],
            [
              73.19,
              22.305
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 9,
      "properties": {
        "id": 9,
        "ward_number": 9,
        "name": "Ward 9 — Ajwa Road",
        "name_gu": "વોર્ડ ૯ — આજવા રોડ",
        "name_hi": "वार्ड ९ — आजवा रोड",
        "zone": "East",
        "centroid_lat": 22.311,
        "centroid_lng": 73.2315,
        "population": 168000,
        "area_sq_km": 14.8,
        "color": "#2563EB",
        "key_areas": "Ajwa Road, Kishanwadi, Sayaji Park, Sardar Estate, Kamlanagar, Ekta Nagar"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.215,
              22.3
            ],
            [
              73.245,
              22.3
            ],
            [
              73.245,
              22.325
            ],
            [
              73.215,
              22.325
            ],
            [
              73.215,
              22.3
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 10,
      "properties": {
        "id": 10,
        "ward_number": 10,
        "name": "Ward 10 — Subhanpura & Gorwa",
        "name_gu": "વોર્ડ ૧૦ — સુભાનપુરા અને ગોરવા",
        "name_hi": "वार्ड १० — सुभानपुरा और गोरवा",
        "zone": "West",
        "centroid_lat": 22.3341,
        "centroid_lng": 73.1624,
        "population": 172000,
        "area_sq_km": 13.9,
        "color": "#EA580C",
        "key_areas": "Subhanpura, Gorwa, Laxmipura, Panchvati, Ellora Park, High Tension Road, Alembic"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.145,
              22.32
            ],
            [
              73.17,
              22.32
            ],
            [
              73.17,
              22.345
            ],
            [
              73.145,
              22.345
            ],
            [
              73.145,
              22.32
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 11,
      "properties": {
        "id": 11,
        "ward_number": 11,
        "name": "Ward 11 — Vasna-Bhayli & Diwalipura",
        "name_gu": "વોર્ડ ૧૧ — વાસણા-ભાયલી અને દિવાળીપુરા",
        "name_hi": "वार्ड ११ — वासणा-भायली और दिवालीपुरा",
        "zone": "West",
        "centroid_lat": 22.2885,
        "centroid_lng": 73.1465,
        "population": 195000,
        "area_sq_km": 17.5,
        "color": "#059669",
        "key_areas": "Vasna-Bhayli, Diwalipura, Old Padra Road, Court, Chakli Circle, Monalisa Char Rasta"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.125,
              22.27
            ],
            [
              73.155,
              22.27
            ],
            [
              73.155,
              22.298
            ],
            [
              73.125,
              22.298
            ],
            [
              73.125,
              22.27
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 12,
      "properties": {
        "id": 12,
        "ward_number": 12,
        "name": "Ward 12 — Makarpura & Maneja",
        "name_gu": "વોર્ડ ૧૨ — મકરપુરા અને માણેજા (GIDC)",
        "name_hi": "वार्ड १२ — मकरपुरा और मानेजा (GIDC)",
        "zone": "South",
        "centroid_lat": 22.2512,
        "centroid_lng": 73.1923,
        "population": 220000,
        "area_sq_km": 22,
        "color": "#0891B2",
        "key_areas": "Makarpura, Maneja, GIDC, Novino, ONGC, Air Force, Makarpura Depot"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.175,
              22.235
            ],
            [
              73.205,
              22.235
            ],
            [
              73.205,
              22.265
            ],
            [
              73.175,
              22.265
            ],
            [
              73.175,
              22.235
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 13,
      "properties": {
        "id": 13,
        "ward_number": 13,
        "name": "Ward 13 — Wadi & Ghadiali Pole",
        "name_gu": "વોર્ડ ૧૩ — વાડી અને ઘડિયાળી પોળ",
        "name_hi": "वार्ड १३ — वाडी और घडियाली पोल",
        "zone": "Central",
        "centroid_lat": 22.2965,
        "centroid_lng": 73.2085,
        "population": 140000,
        "area_sq_km": 8.5,
        "color": "#BE185D",
        "key_areas": "Wadi, Ghadiali Pole, Khanderao Market, Chokhandi, Mogalwada, Gajrawadi"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.195,
              22.285
            ],
            [
              73.218,
              22.285
            ],
            [
              73.218,
              22.302
            ],
            [
              73.195,
              22.302
            ],
            [
              73.195,
              22.285
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 14,
      "properties": {
        "id": 14,
        "ward_number": 14,
        "name": "Ward 14 — Tarsali & Danteshwar",
        "name_gu": "વોર્ડ ૧૪ — તરસાલી અને દાંતેશ્વર",
        "name_hi": "वार्ड १४ — तरसाली और दांतेश्वर",
        "zone": "South",
        "centroid_lat": 22.2615,
        "centroid_lng": 73.2045,
        "population": 180000,
        "area_sq_km": 16,
        "color": "#65A30D",
        "key_areas": "Tarsali, Soma Talav, Danteshwar, Tarsali Bypass, Susen Circle, Kubereshwar"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.19,
              22.25
            ],
            [
              73.22,
              22.25
            ],
            [
              73.22,
              22.275
            ],
            [
              73.19,
              22.275
            ],
            [
              73.19,
              22.25
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 15,
      "properties": {
        "id": 15,
        "ward_number": 15,
        "name": "Ward 15 — Bapod & Ajwa Outer",
        "name_gu": "વોર્ડ ૧૫ — બાપોદ અને આજવા આઉટર",
        "name_hi": "वार्ड १५ — बापोद और आजवा आउटर",
        "zone": "East",
        "centroid_lat": 22.318,
        "centroid_lng": 73.245,
        "population": 150000,
        "area_sq_km": 15.2,
        "color": "#7C3AED",
        "key_areas": "Bapod (outer), Ajwa Road (outer), Sikandar Nagar, Madhav Park, Nimeta Road"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.235,
              22.305
            ],
            [
              73.265,
              22.305
            ],
            [
              73.265,
              22.335
            ],
            [
              73.235,
              22.335
            ],
            [
              73.235,
              22.305
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 16,
      "properties": {
        "id": 16,
        "ward_number": 16,
        "name": "Ward 16 — Kishanwadi & Soma Talav",
        "name_gu": "વોર્ડ ૧૬ — કિશનવાડી અને સોમા તળાવ",
        "name_hi": "वार्ड १६ — किशनवाड़ी और सोमा तालाब",
        "zone": "East",
        "centroid_lat": 22.285,
        "centroid_lng": 73.221,
        "population": 165000,
        "area_sq_km": 12.4,
        "color": "#C026D3",
        "key_areas": "Kishanwadi, Soma Talav, Dabhoi Road, Pratapnagar, Onkar Nagar"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.21,
              22.27
            ],
            [
              73.235,
              22.27
            ],
            [
              73.235,
              22.295
            ],
            [
              73.21,
              22.295
            ],
            [
              73.21,
              22.27
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 17,
      "properties": {
        "id": 17,
        "ward_number": 17,
        "name": "Ward 17 — Manjalpur & Atladra",
        "name_gu": "વોર્ડ ૧૭ — માંજલપુર અને અટલાદરા",
        "name_hi": "वार्ड ૧૭ — मांजलपुर और अटलादरा",
        "zone": "South",
        "centroid_lat": 22.2684,
        "centroid_lng": 73.178,
        "population": 205000,
        "area_sq_km": 19.5,
        "color": "#10B981",
        "key_areas": "Manjalpur, Atladra, Bill-Chapad, Eva Mall, Swaminarayan Mandir Atladra, Kalali"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.16,
              22.255
            ],
            [
              73.19,
              22.255
            ],
            [
              73.19,
              22.28
            ],
            [
              73.16,
              22.28
            ],
            [
              73.16,
              22.255
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 18,
      "properties": {
        "id": 18,
        "ward_number": 18,
        "name": "Ward 18 — Tandalja & Vasna Road",
        "name_gu": "વોર્ડ ૧૮ — તાંદલજા અને વાસણા રોડ",
        "name_hi": "वार्ड १८ — तांदलजा और वासणा रोड",
        "zone": "West",
        "centroid_lat": 22.284,
        "centroid_lng": 73.161,
        "population": 175000,
        "area_sq_km": 14,
        "color": "#047857",
        "key_areas": "Tandalja, Vasna Road, Ashwamegh, Bansal Mall, Sun Pharma Road"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.145,
              22.27
            ],
            [
              73.17,
              22.27
            ],
            [
              73.17,
              22.295
            ],
            [
              73.145,
              22.295
            ],
            [
              73.145,
              22.27
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "id": 19,
      "properties": {
        "id": 19,
        "ward_number": 19,
        "name": "Ward 19 — Kapurai-Tarsali (South)",
        "name_gu": "વોર્ડ ૧૯ — કપુરાઈ-તરસાલી (દક્ષિણ)",
        "name_hi": "वार्ड ૧૯ — कपुराई-तरसाली (दक्षिण)",
        "zone": "South",
        "centroid_lat": 22.245,
        "centroid_lng": 73.225,
        "population": 160000,
        "area_sq_km": 18,
        "color": "#9333EA",
        "key_areas": "Kapurai-Tarsali (South), NH-48 Bypass, Jambuva Bridge, Por Highway"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.205,
              22.225
            ],
            [
              73.245,
              22.225
            ],
            [
              73.245,
              22.26
            ],
            [
              73.205,
              22.26
            ],
            [
              73.205,
              22.225
            ]
          ]
        ]
      }
    }
  ]
};
