
export enum MeasurementLabel {
  Shoulders = "SHOULDERS",
  Arms = "ARMS",
  Sleeve = "SLEEVE",
  Chest = "CHEST",
  Waist = "WAIST",
  Hips = "HIPS",
}

export enum MeasurementGroupName {
  MenShirts = "MEN SHIRTS",
  MenTops = "MEN T-SHIRTS OR POLO",
  MenPants = "MEN PANTS",
  MenOthers = "MEN JACKETS & COATS",
  WomenTops = "WOMEN TOPS",
  WomenPants = "WOMEN PANTS",
  WomenSkirtsShorts = "WOMEN SKIRTS & SHORTS",
}

export interface MeasurementItem {
  label: MeasurementLabel;
  valueCm: number;
  valueIn: number;
}

export interface SizeEntry {
  name: string;
  measurement: MeasurementItem[];
}

export interface MeasurementGroup {
  group: MeasurementGroupName;
  size: SizeEntry[];
}

export interface CountrySize {
  country: string;
  measureGroups: MeasurementGroup[];
}



export const GhanaMeasurementGroups: MeasurementGroup[] = [
  // 👕 MEN SHIRTS
  {
    group: MeasurementGroupName.MenShirts,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 44, valueIn: 17.5 },
          { label: MeasurementLabel.Arms, valueCm: 61, valueIn: 24 },
          { label: MeasurementLabel.Chest, valueCm: 100, valueIn: 39.5 },
          { label: MeasurementLabel.Waist, valueCm: 88, valueIn: 34.6 },
          { label: MeasurementLabel.Hips, valueCm: 94, valueIn: 37 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 46, valueIn: 18 },
          { label: MeasurementLabel.Arms, valueCm: 62, valueIn: 24.5 },
          { label: MeasurementLabel.Chest, valueCm: 106, valueIn: 41.5 },
          { label: MeasurementLabel.Waist, valueCm: 94, valueIn: 37 },
          { label: MeasurementLabel.Hips, valueCm: 98, valueIn: 38.5 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 48, valueIn: 19 },
          { label: MeasurementLabel.Arms, valueCm: 63, valueIn: 25 },
          { label: MeasurementLabel.Chest, valueCm: 112, valueIn: 44 },
          { label: MeasurementLabel.Waist, valueCm: 100, valueIn: 39.4 },
          { label: MeasurementLabel.Hips, valueCm: 102, valueIn: 40 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 50, valueIn: 19.5 },
          { label: MeasurementLabel.Arms, valueCm: 64, valueIn: 25.5 },
          { label: MeasurementLabel.Chest, valueCm: 118, valueIn: 46.5 },
          { label: MeasurementLabel.Waist, valueCm: 108, valueIn: 42.5 },
          { label: MeasurementLabel.Hips, valueCm: 108, valueIn: 42.5 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 52, valueIn: 20.5 },
          { label: MeasurementLabel.Arms, valueCm: 65, valueIn: 26 },
          { label: MeasurementLabel.Chest, valueCm: 124, valueIn: 49 },
          { label: MeasurementLabel.Waist, valueCm: 114, valueIn: 45 },
          { label: MeasurementLabel.Hips, valueCm: 114, valueIn: 45 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 54, valueIn: 21 },
          { label: MeasurementLabel.Arms, valueCm: 66, valueIn: 26.5 },
          { label: MeasurementLabel.Chest, valueCm: 130, valueIn: 51 },
          { label: MeasurementLabel.Waist, valueCm: 120, valueIn: 47 },
          { label: MeasurementLabel.Hips, valueCm: 120, valueIn: 47 },
        ],
      },
    ],
  },

  // 👕 MEN T-SHIRTS / POLO
  {
    group: MeasurementGroupName.MenTops,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 43.5, valueIn: 17 },
          { label: MeasurementLabel.Arms, valueCm: 20, valueIn: 7.9 },
          { label: MeasurementLabel.Chest, valueCm: 98, valueIn: 38.5 },
          { label: MeasurementLabel.Waist, valueCm: 78, valueIn: 30.7 },
          { label: MeasurementLabel.Hips, valueCm: 94, valueIn: 37 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 45.5, valueIn: 18 },
          { label: MeasurementLabel.Arms, valueCm: 21, valueIn: 8.3 },
          { label: MeasurementLabel.Chest, valueCm: 104, valueIn: 41 },
          { label: MeasurementLabel.Waist, valueCm: 83, valueIn: 32.7 },
          { label: MeasurementLabel.Hips, valueCm: 99, valueIn: 39 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 47.5, valueIn: 18.5 },
          { label: MeasurementLabel.Arms, valueCm: 21.5, valueIn: 8.5 },
          { label: MeasurementLabel.Chest, valueCm: 110, valueIn: 43.5 },
          { label: MeasurementLabel.Waist, valueCm: 88, valueIn: 34.6 },
          { label: MeasurementLabel.Hips, valueCm: 104, valueIn: 40.9 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 49.5, valueIn: 19.5 },
          { label: MeasurementLabel.Arms, valueCm: 22, valueIn: 8.7 },
          { label: MeasurementLabel.Chest, valueCm: 116, valueIn: 45.5 },
          { label: MeasurementLabel.Waist, valueCm: 93, valueIn: 36.6 },
          { label: MeasurementLabel.Hips, valueCm: 109, valueIn: 42.9 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 51.5, valueIn: 20.5 },
          { label: MeasurementLabel.Arms, valueCm: 22.5, valueIn: 8.9 },
          { label: MeasurementLabel.Chest, valueCm: 122, valueIn: 48 },
          { label: MeasurementLabel.Waist, valueCm: 98, valueIn: 38.6 },
          { label: MeasurementLabel.Hips, valueCm: 114, valueIn: 44.9 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 53.5, valueIn: 21 },
          { label: MeasurementLabel.Arms, valueCm: 23, valueIn: 9 },
          { label: MeasurementLabel.Chest, valueCm: 128, valueIn: 50.5 },
          { label: MeasurementLabel.Waist, valueCm: 103, valueIn: 40.6 },
          { label: MeasurementLabel.Hips, valueCm: 119, valueIn: 46.9 },
        ],
      },
    ],
  },
   {
    group: MeasurementGroupName.MenOthers,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 43.5, valueIn: 17 },
          { label: MeasurementLabel.Arms, valueCm: 20, valueIn: 7.9 },
          { label: MeasurementLabel.Chest, valueCm: 98, valueIn: 38.5 },
          { label: MeasurementLabel.Waist, valueCm: 78, valueIn: 30.7 },
          { label: MeasurementLabel.Hips, valueCm: 94, valueIn: 37 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 45.5, valueIn: 18 },
          { label: MeasurementLabel.Arms, valueCm: 21, valueIn: 8.3 },
          { label: MeasurementLabel.Chest, valueCm: 104, valueIn: 41 },
          { label: MeasurementLabel.Waist, valueCm: 83, valueIn: 32.7 },
          { label: MeasurementLabel.Hips, valueCm: 99, valueIn: 39 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 47.5, valueIn: 18.5 },
          { label: MeasurementLabel.Arms, valueCm: 21.5, valueIn: 8.5 },
          { label: MeasurementLabel.Chest, valueCm: 110, valueIn: 43.5 },
          { label: MeasurementLabel.Waist, valueCm: 88, valueIn: 34.6 },
          { label: MeasurementLabel.Hips, valueCm: 104, valueIn: 40.9 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 49.5, valueIn: 19.5 },
          { label: MeasurementLabel.Arms, valueCm: 22, valueIn: 8.7 },
          { label: MeasurementLabel.Chest, valueCm: 116, valueIn: 45.5 },
          { label: MeasurementLabel.Waist, valueCm: 93, valueIn: 36.6 },
          { label: MeasurementLabel.Hips, valueCm: 109, valueIn: 42.9 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 51.5, valueIn: 20.5 },
          { label: MeasurementLabel.Arms, valueCm: 22.5, valueIn: 8.9 },
          { label: MeasurementLabel.Chest, valueCm: 122, valueIn: 48 },
          { label: MeasurementLabel.Waist, valueCm: 98, valueIn: 38.6 },
          { label: MeasurementLabel.Hips, valueCm: 114, valueIn: 44.9 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Shoulders, valueCm: 53.5, valueIn: 21 },
          { label: MeasurementLabel.Arms, valueCm: 23, valueIn: 9 },
          { label: MeasurementLabel.Chest, valueCm: 128, valueIn: 50.5 },
          { label: MeasurementLabel.Waist, valueCm: 103, valueIn: 40.6 },
          { label: MeasurementLabel.Hips, valueCm: 119, valueIn: 46.9 },
        ],
      },
    ],
  },

  // 👖 MEN PANTS
  {
    group: MeasurementGroupName.MenPants,
    size: [
      { name: "S", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 76, valueIn: 30 },
        { label: MeasurementLabel.Hips, valueCm: 92, valueIn: 36 },
      ]},
      { name: "M", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 80, valueIn: 31.5 },
        { label: MeasurementLabel.Hips, valueCm: 96, valueIn: 37.8 },
      ]},
      { name: "L", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 88, valueIn: 34.5 },
        { label: MeasurementLabel.Hips, valueCm: 104, valueIn: 41 },
      ]},
      { name: "XL", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 92, valueIn: 36 },
        { label: MeasurementLabel.Hips, valueCm: 108, valueIn: 42.5 },
      ]},
      { name: "XXL", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 96, valueIn: 38 },
        { label: MeasurementLabel.Hips, valueCm: 112, valueIn: 44 },
      ]},
      { name: "XXXL", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 100, valueIn: 39.5 },
        { label: MeasurementLabel.Hips, valueCm: 116, valueIn: 45.5 },
      ]},
    ],
  },

  // 👚 WOMEN TOPS
  {
    group: MeasurementGroupName.WomenTops,
    size: [
      { name: "S", measurement: [
        { label: MeasurementLabel.Chest, valueCm: 90, valueIn: 35.4 },
        { label: MeasurementLabel.Waist, valueCm: 74, valueIn: 29.1 },
        { label: MeasurementLabel.Hips, valueCm: 90, valueIn: 35.4 },
      ]},
      { name: "M", measurement: [
        { label: MeasurementLabel.Chest, valueCm: 94, valueIn: 37 },
        { label: MeasurementLabel.Waist, valueCm: 78, valueIn: 30.7 },
        { label: MeasurementLabel.Hips, valueCm: 96, valueIn: 37.8 },
      ]},
      { name: "L", measurement: [
        { label: MeasurementLabel.Chest, valueCm: 98, valueIn: 38.6 },
        { label: MeasurementLabel.Waist, valueCm: 82, valueIn: 32.3 },
        { label: MeasurementLabel.Hips, valueCm: 100, valueIn: 39.4 },
      ]},
      { name: "XL", measurement: [
        { label: MeasurementLabel.Chest, valueCm: 102, valueIn: 40.2 },
        { label: MeasurementLabel.Waist, valueCm: 86, valueIn: 33.9 },
        { label: MeasurementLabel.Hips, valueCm: 104, valueIn: 40.9 },
      ]},
      { name: "XXL", measurement: [
        { label: MeasurementLabel.Chest, valueCm: 106, valueIn: 41.7 },
        { label: MeasurementLabel.Waist, valueCm: 90, valueIn: 35.4 },
        { label: MeasurementLabel.Hips, valueCm: 108, valueIn: 42.5 },
      ]},
      { name: "XXXL", measurement: [
        { label: MeasurementLabel.Chest, valueCm: 110, valueIn: 43.3 },
        { label: MeasurementLabel.Waist, valueCm: 94, valueIn: 37 },
        { label: MeasurementLabel.Hips, valueCm: 112, valueIn: 44.1 },
      ]},
    ],
  },

  // 👖 WOMEN PANTS
  {
    group: MeasurementGroupName.WomenPants,
    size: [
      { name: "S", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 70, valueIn: 27.5 },
        { label: MeasurementLabel.Hips, valueCm: 95, valueIn: 37.5 },
      ]},
      { name: "M", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 75, valueIn: 29.5 },
        { label: MeasurementLabel.Hips, valueCm: 100, valueIn: 39.5 },
      ]},
      { name: "L", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 80, valueIn: 31.5 },
        { label: MeasurementLabel.Hips, valueCm: 105, valueIn: 41.5 },
      ]},
      { name: "XL", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 85, valueIn: 33.5 },
        { label: MeasurementLabel.Hips, valueCm: 110, valueIn: 43.5 },
      ]},
      { name: "XXL", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 90, valueIn: 35.5 },
        { label: MeasurementLabel.Hips, valueCm: 115, valueIn: 45.5 },
      ]},
      { name: "XXXL", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 95, valueIn: 37.5 },
        { label: MeasurementLabel.Hips, valueCm: 120, valueIn: 47.5 },
      ]},
    ],
  },

  // 👗 WOMEN SKIRTS & SHORTS
  {
    group: MeasurementGroupName.WomenSkirtsShorts,
    size: [
      { name: "S", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 70, valueIn: 27.5 },
        { label: MeasurementLabel.Hips, valueCm: 95, valueIn: 37.5 },
      ]},
      { name: "M", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 75, valueIn: 29.5 },
        { label: MeasurementLabel.Hips, valueCm: 100, valueIn: 39.5 },
      ]},
      { name: "L", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 80, valueIn: 31.5 },
        { label: MeasurementLabel.Hips, valueCm: 105, valueIn: 41.5 },
      ]},
      { name: "XL", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 85, valueIn: 33.5 },
        { label: MeasurementLabel.Hips, valueCm: 110, valueIn: 43.5 },
      ]},
      { name: "XXL", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 90, valueIn: 35.5 },
        { label: MeasurementLabel.Hips, valueCm: 115, valueIn: 45.5 },
      ]},
      { name: "XXXL", measurement: [
        { label: MeasurementLabel.Waist, valueCm: 95, valueIn: 37.5 },
        { label: MeasurementLabel.Hips, valueCm: 120, valueIn: 47.5 },
      ]},
    ],
  },
];


export const Sizes: CountrySize[] = [
  {
    country: "GHANA",
    measureGroups: GhanaMeasurementGroups,
  },
  {
    country: "USA",
    measureGroups: GhanaMeasurementGroups,
  },
  {
    country: "UK",
    measureGroups: GhanaMeasurementGroups,
  },
  {
    country: "France",
    measureGroups: GhanaMeasurementGroups,
  },
  {
    country: "Italy",
    measureGroups: GhanaMeasurementGroups,
  },
  {
    country: "Canada",
    measureGroups: GhanaMeasurementGroups,
  },
];





