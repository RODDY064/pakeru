type MeasurementLabel = "SHOULDERS" | "ARMS" | "CHEST" | "WAIST" | "HIPS";

interface MeasurementItem {
  label: MeasurementLabel;
  value: string; 
}

interface SizeEntry {
  name: string;                
  measurement: MeasurementItem[]; 
}

interface CountrySize {
  country: string; 
  size: SizeEntry[];
}



export const Sizes: CountrySize[] = [
  /* ------------------ USA ------------------ */
  {
    country: "USA",
    size: [
      {
        name: "XXS",
        measurement: [
          { label: "SHOULDERS", value: '44 cm - 17.5"' }, // your value
          { label: "ARMS",      value: '86 cm - 33.8"' }, // your value
          { label: "CHEST",     value: '90 cm - 35.6"' }, // your value
          { label: "WAIST",     value: '74 cm - 29.1"' }, // fixed (was "4 cm")
          { label: "HIPS",      value: '91 cm - 35.8"' }, // your value
        ],
      },
      {
        name: "XS",
        measurement: [
          { label: "SHOULDERS", value: '45 cm - 17.7"' },
          { label: "ARMS",      value: '88 cm - 34.6"' },
          { label: "CHEST",     value: '92 cm - 36.2"' },
          { label: "WAIST",     value: '76 cm - 29.9"' },
          { label: "HIPS",      value: '93 cm - 36.6"' },
        ],
      },
      {
        name: "S",
        measurement: [
          { label: "SHOULDERS", value: '46 cm - 18.1"' }, // your shoulders+S
          { label: "ARMS",      value: '90 cm - 35.4"' }, // scaled
          { label: "CHEST",     value: '94 cm - 37.0"' }, // scaled
          { label: "WAIST",     value: '78 cm - 30.7"' }, // scaled
          { label: "HIPS",      value: '95 cm - 37.4"' }, // scaled
        ],
      },
      {
        name: "M",
        measurement: [
          { label: "SHOULDERS", value: '47 cm - 18.5"' },
          { label: "ARMS",      value: '92 cm - 36.2"' },
          { label: "CHEST",     value: '96 cm - 37.8"' },
          { label: "WAIST",     value: '80 cm - 31.5"' },
          { label: "HIPS",      value: '97 cm - 38.2"' },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: "SHOULDERS", value: '48 cm - 18.9"' },
          { label: "ARMS",      value: '94 cm - 37.0"' },
          { label: "CHEST",     value: '98 cm - 38.6"' },
          { label: "WAIST",     value: '82 cm - 32.3"' },
          { label: "HIPS",      value: '99 cm - 39.0"' },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: "SHOULDERS", value: '49 cm - 19.3"' },
          { label: "ARMS",      value: '96 cm - 37.8"' },
          { label: "CHEST",     value: '100 cm - 39.4"' },
          { label: "WAIST",     value: '84 cm - 33.1"' },
          { label: "HIPS",      value: '101 cm - 39.8"' },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: "SHOULDERS", value: '50 cm - 19.7"' },
          { label: "ARMS",      value: '98 cm - 38.6"' },
          { label: "CHEST",     value: '102 cm - 40.2"' },
          { label: "WAIST",     value: '86 cm - 33.9"' },
          { label: "HIPS",      value: '103 cm - 40.6"' },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: "SHOULDERS", value: '51 cm - 20.1"' },
          { label: "ARMS",      value: '100 cm - 39.4"' },
          { label: "CHEST",     value: '104 cm - 40.9"' },
          { label: "WAIST",     value: '88 cm - 34.6"' },
          { label: "HIPS",      value: '105 cm - 41.3"' },
        ],
      },
    ],
  },

  /* ------------------ UK ------------------ */
  {
    country: "UK",
    size: [
      {
        name: "XXS",
        measurement: [
          { label: "SHOULDERS", value: '43 cm - 17.0"' },
          { label: "ARMS",      value: '85 cm - 33.4"' },
          { label: "CHEST",     value: '89 cm - 35.0"' },
          { label: "WAIST",     value: '73 cm - 28.7"' },
          { label: "HIPS",      value: '90 cm - 35.4"' },
        ],
      },
      {
        name: "XS",
        measurement: [
          { label: "SHOULDERS", value: '44 cm - 17.3"' },
          { label: "ARMS",      value: '87 cm - 34.3"' },
          { label: "CHEST",     value: '91 cm - 35.8"' },
          { label: "WAIST",     value: '75 cm - 29.5"' },
          { label: "HIPS",      value: '92 cm - 36.2"' },
        ],
      },
      {
        name: "S",
        measurement: [
          { label: "SHOULDERS", value: '45 cm - 17.7"' }, // your value
          { label: "ARMS",      value: '87 cm - 34.2"' }, // your value
          { label: "CHEST",     value: '91 cm - 35.8"' }, // your value
          { label: "WAIST",     value: '75 cm - 29.5"' }, // your value
          { label: "HIPS",      value: '92 cm - 36.2"' }, // your value
        ],
      },
      {
        name: "M",
        measurement: [
          { label: "SHOULDERS", value: '46 cm - 18.1"' },
          { label: "ARMS",      value: '89 cm - 35.0"' },
          { label: "CHEST",     value: '93 cm - 36.6"' },
          { label: "WAIST",     value: '77 cm - 30.3"' },
          { label: "HIPS",      value: '94 cm - 37.0"' },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: "SHOULDERS", value: '47 cm - 18.5"' },
          { label: "ARMS",      value: '91 cm - 35.8"' },
          { label: "CHEST",     value: '95 cm - 37.4"' },
          { label: "WAIST",     value: '79 cm - 31.1"' },
          { label: "HIPS",      value: '96 cm - 37.8"' },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: "SHOULDERS", value: '48 cm - 18.9"' },
          { label: "ARMS",      value: '93 cm - 36.6"' },
          { label: "CHEST",     value: '97 cm - 38.2"' },
          { label: "WAIST",     value: '81 cm - 31.9"' },
          { label: "HIPS",      value: '98 cm - 38.6"' },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: "SHOULDERS", value: '49 cm - 19.3"' },
          { label: "ARMS",      value: '95 cm - 37.4"' },
          { label: "CHEST",     value: '99 cm - 39.0"' },
          { label: "WAIST",     value: '83 cm - 32.7"' },
          { label: "HIPS",      value: '100 cm - 39.4"' },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: "SHOULDERS", value: '50 cm - 19.7"' },
          { label: "ARMS",      value: '97 cm - 38.2"' },
          { label: "CHEST",     value: '101 cm - 39.8"' },
          { label: "WAIST",     value: '85 cm - 33.5"' },
          { label: "HIPS",      value: '102 cm - 40.2"' },
        ],
      },
    ],
  },

  /* ------------------ Ghana ------------------ */
  // Ghana sizing often tracks UK measurements in apparel retail.
  // Start by mirroring UK values (easy maintenance). Adjust as you collect local fit data.
  {
    country: "GHANA",
    size: [
      {
        name: "XXS",
        measurement: [
          { label: "SHOULDERS", value: '43 cm - 17.0"' },
          { label: "ARMS",      value: '85 cm - 33.4"' },
          { label: "CHEST",     value: '89 cm - 35.0"' },
          { label: "WAIST",     value: '73 cm - 28.7"' },
          { label: "HIPS",      value: '90 cm - 35.4"' },
        ],
      },
      {
        name: "XS",
        measurement: [
          { label: "SHOULDERS", value: '44 cm - 17.3"' },
          { label: "ARMS",      value: '87 cm - 34.3"' },
          { label: "CHEST",     value: '91 cm - 35.8"' },
          { label: "WAIST",     value: '75 cm - 29.5"' },
          { label: "HIPS",      value: '92 cm - 36.2"' },
        ],
      },
      {
        name: "S",
        measurement: [
          { label: "SHOULDERS", value: '45 cm - 17.7"' },
          { label: "ARMS",      value: '89 cm - 35.0"' },
          { label: "CHEST",     value: '93 cm - 36.6"' },
          { label: "WAIST",     value: '77 cm - 30.3"' },
          { label: "HIPS",      value: '94 cm - 37.0"' },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: "SHOULDERS", value: '46 cm - 18.1"' },
          { label: "ARMS",      value: '91 cm - 35.8"' },
          { label: "CHEST",     value: '95 cm - 37.4"' },
          { label: "WAIST",     value: '79 cm - 31.1"' },
          { label: "HIPS",      value: '96 cm - 37.8"' },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: "SHOULDERS", value: '47 cm - 18.5"' },
          { label: "ARMS",      value: '93 cm - 36.6"' },
          { label: "CHEST",     value: '97 cm - 38.2"' },
          { label: "WAIST",     value: '81 cm - 31.9"' },
          { label: "HIPS",      value: '98 cm - 38.6"' },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: "SHOULDERS", value: '48 cm - 18.9"' },
          { label: "ARMS",      value: '95 cm - 37.4"' },
          { label: "CHEST",     value: '99 cm - 39.0"' },
          { label: "WAIST",     value: '83 cm - 32.7"' },
          { label: "HIPS",      value: '100 cm - 39.4"' },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: "SHOULDERS", value: '49 cm - 19.3"' },
          { label: "ARMS",      value: '97 cm - 38.2"' },
          { label: "CHEST",     value: '101 cm - 39.8"' },
          { label: "WAIST",     value: '85 cm - 33.5"' },
          { label: "HIPS",      value: '102 cm - 40.2"' },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: "SHOULDERS", value: '50 cm - 19.7"' },
          { label: "ARMS",      value: '99 cm - 39.0"' },
          { label: "CHEST",     value: '103 cm - 40.6"' },
          { label: "WAIST",     value: '87 cm - 34.3"' },
          { label: "HIPS",      value: '104 cm - 40.9"' },
        ],
      },
    ],
  },
];
