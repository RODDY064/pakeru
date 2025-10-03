
export enum MeasurementLabel {
  Shoulders = "SHOULDERS",
  Arms = "ARMS",
  Sleeve = "SLEEVE",
  Chest = "CHEST",
  Waist = "WAIST",
  Hips = "HIPS",
}

export enum ClothTypeName {
  MenShirts = "MEN SHIRTS",
  MenTshirts = "MEN T-SHIRTS",
  Polo = "POLO",
  MenJeans = "MEN JEANS",
  MenPants = "MEN PANTS",
  MenCargoPants = "MEN CARGO PANTS",
  MenCargoShorts = "MEN CARGO SHORTS",
  MenBaggyJeans = "MEN BAGGY JEANS",
  CropTopShortSleeve = "CROP TOP SHORT SLEEVE",
  CropTopLongSleeve = "CROP TOP LONG SLEEVE",
  PleatedSkirt = "PLEATED SKIRT",
  WomenBaggyJeans = "WOMEN BAGGY JEANS",
  WomenCargoPants = "WOMEN CARGO PANTS",
}

export interface MeasurementItem {
  label: MeasurementLabel;
  valueCm: number; // base unit in cm
  valueIn: number; // converted inches
}

export interface SizeEntry {
  name: string;
  measurement: MeasurementItem[];
}

export interface ClothType {
  type: ClothTypeName;
  size: SizeEntry[];
}

export interface CountrySize {
  country: string;
  clothTypes: ClothType[];
}

const GhanaClothTypes: ClothType[] = [
  // MEN SHIRTS
  {
    type: ClothTypeName.MenShirts,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 100.0, valueIn: 39.5 },
          { label: MeasurementLabel.Shoulders, valueCm: 44.0, valueIn: 17.5 },
          { label: MeasurementLabel.Sleeve, valueCm: 61.0, valueIn: 24.0 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 106.0, valueIn: 41.5 },
          { label: MeasurementLabel.Shoulders, valueCm: 46.0, valueIn: 18.0 },
          { label: MeasurementLabel.Sleeve, valueCm: 62.0, valueIn: 24.5 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 112.0, valueIn: 44.0 },
          { label: MeasurementLabel.Shoulders, valueCm: 48.0, valueIn: 19.0 },
          { label: MeasurementLabel.Sleeve, valueCm: 63.0, valueIn: 25.0 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 118.0, valueIn: 46.5 },
          { label: MeasurementLabel.Shoulders, valueCm: 50.0, valueIn: 19.5 },
          { label: MeasurementLabel.Sleeve, valueCm: 64.0, valueIn: 25.5 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 124.0, valueIn: 49.0 },
          { label: MeasurementLabel.Shoulders, valueCm: 52.0, valueIn: 20.5 },
          { label: MeasurementLabel.Sleeve, valueCm: 65.0, valueIn: 26.0 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 130.0, valueIn: 51.0 },
          { label: MeasurementLabel.Shoulders, valueCm: 54.0, valueIn: 21.0 },
          { label: MeasurementLabel.Sleeve, valueCm: 66.0, valueIn: 26.5 },
        ],
      },
    ],
  },
  // MEN T-SHIRTS
  {
    type: ClothTypeName.MenTshirts,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 96.0, valueIn: 38.0 },
          { label: MeasurementLabel.Shoulders, valueCm: 43.0, valueIn: 17.0 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 102.0, valueIn: 40.0 },
          { label: MeasurementLabel.Shoulders, valueCm: 45.0, valueIn: 17.5 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 108.0, valueIn: 42.5 },
          { label: MeasurementLabel.Shoulders, valueCm: 47.0, valueIn: 18.5 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 114.0, valueIn: 45.0 },
          { label: MeasurementLabel.Shoulders, valueCm: 49.0, valueIn: 19.5 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 120.0, valueIn: 47.0 },
          { label: MeasurementLabel.Shoulders, valueCm: 51.0, valueIn: 20.0 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 126.0, valueIn: 49.5 },
          { label: MeasurementLabel.Shoulders, valueCm: 53.0, valueIn: 21.0 },
        ],
      },
    ],
  },
  // POLO
  {
    type: ClothTypeName.Polo,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 98.0, valueIn: 38.5 },
          { label: MeasurementLabel.Shoulders, valueCm: 43.5, valueIn: 17.0 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 104.0, valueIn: 41.0 },
          { label: MeasurementLabel.Shoulders, valueCm: 45.5, valueIn: 18.0 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 110.0, valueIn: 43.5 },
          { label: MeasurementLabel.Shoulders, valueCm: 47.5, valueIn: 18.5 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 116.0, valueIn: 45.5 },
          { label: MeasurementLabel.Shoulders, valueCm: 49.5, valueIn: 19.5 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 122.0, valueIn: 48.0 },
          { label: MeasurementLabel.Shoulders, valueCm: 51.5, valueIn: 20.5 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 128.0, valueIn: 50.5 },
          { label: MeasurementLabel.Shoulders, valueCm: 53.5, valueIn: 21.0 },
        ],
      },
    ],
  },
  // MEN JEANS
  {
    type: ClothTypeName.MenJeans,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 78.0, valueIn: 30.5 },
          { label: MeasurementLabel.Hips, valueCm: 94.0, valueIn: 37.0 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 82.0, valueIn: 32.0 },
          { label: MeasurementLabel.Hips, valueCm: 98.0, valueIn: 38.5 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 86.0, valueIn: 34.0 },
          { label: MeasurementLabel.Hips, valueCm: 102.0, valueIn: 40.0 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 92.0, valueIn: 36.0 },
          { label: MeasurementLabel.Hips, valueCm: 108.0, valueIn: 42.5 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 98.0, valueIn: 38.5 },
          { label: MeasurementLabel.Hips, valueCm: 114.0, valueIn: 45.0 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 104.0, valueIn: 41.0 },
          { label: MeasurementLabel.Hips, valueCm: 120.0, valueIn: 47.0 },
        ],
      },
    ],
  },
  // MEN PANTS
  {
    type: ClothTypeName.MenPants,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 76.0, valueIn: 30.0 },
          { label: MeasurementLabel.Hips, valueCm: 92.0, valueIn: 36.0 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 80.0, valueIn: 31.5 },
          { label: MeasurementLabel.Hips, valueCm: 96.0, valueIn: 37.8 },
        ],
      },
      {
        name: "M/L",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 84.0, valueIn: 33.0 },
          { label: MeasurementLabel.Hips, valueCm: 100.0, valueIn: 39.0 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 88.0, valueIn: 34.5 },
          { label: MeasurementLabel.Hips, valueCm: 104.0, valueIn: 41.0 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 92.0, valueIn: 36.0 },
          { label: MeasurementLabel.Hips, valueCm: 108.0, valueIn: 42.5 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 96.0, valueIn: 38.0 },
          { label: MeasurementLabel.Hips, valueCm: 112.0, valueIn: 44.0 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 100.0, valueIn: 39.5 },
          { label: MeasurementLabel.Hips, valueCm: 116.0, valueIn: 45.5 },
        ],
      },
    ],
  },
  // MEN CARGO PANTS
  {
    type: ClothTypeName.MenCargoPants,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 78.0, valueIn: 30.7 },
          { label: MeasurementLabel.Hips, valueCm: 94.0, valueIn: 37.0 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 83.0, valueIn: 32.7 },
          { label: MeasurementLabel.Hips, valueCm: 99.0, valueIn: 39.0 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 88.0, valueIn: 34.6 },
          { label: MeasurementLabel.Hips, valueCm: 104.0, valueIn: 40.9 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 93.0, valueIn: 36.6 },
          { label: MeasurementLabel.Hips, valueCm: 109.0, valueIn: 42.9 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 98.0, valueIn: 38.6 },
          { label: MeasurementLabel.Hips, valueCm: 114.0, valueIn: 44.9 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 103.0, valueIn: 40.6 },
          { label: MeasurementLabel.Hips, valueCm: 119.0, valueIn: 46.9 },
        ],
      },
    ],
  },
  // MEN CARGO SHORTS (same as MEN CARGO PANTS)
  {
    type: ClothTypeName.MenCargoShorts,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 78.0, valueIn: 30.7 },
          { label: MeasurementLabel.Hips, valueCm: 94.0, valueIn: 37.0 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 83.0, valueIn: 32.7 },
          { label: MeasurementLabel.Hips, valueCm: 99.0, valueIn: 39.0 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 88.0, valueIn: 34.6 },
          { label: MeasurementLabel.Hips, valueCm: 104.0, valueIn: 40.9 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 93.0, valueIn: 36.6 },
          { label: MeasurementLabel.Hips, valueCm: 109.0, valueIn: 42.9 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 98.0, valueIn: 38.6 },
          { label: MeasurementLabel.Hips, valueCm: 114.0, valueIn: 44.9 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 103.0, valueIn: 40.6 },
          { label: MeasurementLabel.Hips, valueCm: 119.0, valueIn: 46.9 },
        ],
      },
    ],
  },
  // MEN BAGGY JEANS
  {
    type: ClothTypeName.MenBaggyJeans,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 76.0, valueIn: 30.0 },
          { label: MeasurementLabel.Hips, valueCm: 98.0, valueIn: 38.6 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 81.0, valueIn: 32.0 },
          { label: MeasurementLabel.Hips, valueCm: 103.0, valueIn: 40.6 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 86.0, valueIn: 34.0 },
          { label: MeasurementLabel.Hips, valueCm: 108.0, valueIn: 42.5 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 91.0, valueIn: 36.0 },
          { label: MeasurementLabel.Hips, valueCm: 113.0, valueIn: 44.5 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 96.0, valueIn: 38.0 },
          { label: MeasurementLabel.Hips, valueCm: 118.0, valueIn: 46.5 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 101.0, valueIn: 39.8 },
          { label: MeasurementLabel.Hips, valueCm: 123.0, valueIn: 48.4 },
        ],
      },
    ],
  },
  // CROP TOP SHORT SLEEVE
  {
    type: ClothTypeName.CropTopShortSleeve,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 90.0, valueIn: 35.4 },
          { label: MeasurementLabel.Shoulders, valueCm: 42.0, valueIn: 16.5 },
          { label: MeasurementLabel.Waist, valueCm: 74.0, valueIn: 29.1 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 94.0, valueIn: 37.0 },
          { label: MeasurementLabel.Shoulders, valueCm: 43.0, valueIn: 16.9 },
          { label: MeasurementLabel.Waist, valueCm: 78.0, valueIn: 30.7 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 98.0, valueIn: 38.6 },
          { label: MeasurementLabel.Shoulders, valueCm: 44.0, valueIn: 17.3 },
          { label: MeasurementLabel.Waist, valueCm: 82.0, valueIn: 32.3 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 102.0, valueIn: 40.2 },
          { label: MeasurementLabel.Shoulders, valueCm: 45.0, valueIn: 17.7 },
          { label: MeasurementLabel.Waist, valueCm: 86.0, valueIn: 33.9 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 106.0, valueIn: 41.7 },
          { label: MeasurementLabel.Shoulders, valueCm: 46.0, valueIn: 18.1 },
          { label: MeasurementLabel.Waist, valueCm: 90.0, valueIn: 35.4 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 110.0, valueIn: 43.3 },
          { label: MeasurementLabel.Shoulders, valueCm: 47.0, valueIn: 18.5 },
          { label: MeasurementLabel.Waist, valueCm: 94.0, valueIn: 37.0 },
        ],
      },
    ],
  },
  // CROP TOP LONG SLEEVE (same as short sleeve)
  {
    type: ClothTypeName.CropTopLongSleeve,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 90.0, valueIn: 35.4 },
          { label: MeasurementLabel.Shoulders, valueCm: 42.0, valueIn: 16.5 },
          { label: MeasurementLabel.Waist, valueCm: 74.0, valueIn: 29.1 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 94.0, valueIn: 37.0 },
          { label: MeasurementLabel.Shoulders, valueCm: 43.0, valueIn: 16.9 },
          { label: MeasurementLabel.Waist, valueCm: 78.0, valueIn: 30.7 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 98.0, valueIn: 38.6 },
          { label: MeasurementLabel.Shoulders, valueCm: 44.0, valueIn: 17.3 },
          { label: MeasurementLabel.Waist, valueCm: 82.0, valueIn: 32.3 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 102.0, valueIn: 40.2 },
          { label: MeasurementLabel.Shoulders, valueCm: 45.0, valueIn: 17.7 },
          { label: MeasurementLabel.Waist, valueCm: 86.0, valueIn: 33.9 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 106.0, valueIn: 41.7 },
          { label: MeasurementLabel.Shoulders, valueCm: 46.0, valueIn: 18.1 },
          { label: MeasurementLabel.Waist, valueCm: 90.0, valueIn: 35.4 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Chest, valueCm: 110.0, valueIn: 43.3 },
          { label: MeasurementLabel.Shoulders, valueCm: 47.0, valueIn: 18.5 },
          { label: MeasurementLabel.Waist, valueCm: 94.0, valueIn: 37.0 },
        ],
      },
    ],
  },
  // PLEATED SKIRT
  {
    type: ClothTypeName.PleatedSkirt,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 68.0, valueIn: 26.8 },
          { label: MeasurementLabel.Hips, valueCm: 92.0, valueIn: 36.2 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 72.0, valueIn: 28.3 },
          { label: MeasurementLabel.Hips, valueCm: 96.0, valueIn: 37.8 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 76.0, valueIn: 29.9 },
          { label: MeasurementLabel.Hips, valueCm: 100.0, valueIn: 39.4 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 80.0, valueIn: 31.5 },
          { label: MeasurementLabel.Hips, valueCm: 104.0, valueIn: 40.9 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 84.0, valueIn: 33.1 },
          { label: MeasurementLabel.Hips, valueCm: 108.0, valueIn: 42.5 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 88.0, valueIn: 34.6 },
          { label: MeasurementLabel.Hips, valueCm: 112.0, valueIn: 44.1 },
        ],
      },
    ],
  },
  // WOMEN BAGGY JEANS
  {
    type: ClothTypeName.WomenBaggyJeans,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 70.0, valueIn: 27.5 },
          { label: MeasurementLabel.Hips, valueCm: 95.0, valueIn: 37.5 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 75.0, valueIn: 29.5 },
          { label: MeasurementLabel.Hips, valueCm: 100.0, valueIn: 39.5 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 80.0, valueIn: 31.5 },
          { label: MeasurementLabel.Hips, valueCm: 105.0, valueIn: 41.5 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 85.0, valueIn: 33.5 },
          { label: MeasurementLabel.Hips, valueCm: 110.0, valueIn: 43.5 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 90.0, valueIn: 35.5 },
          { label: MeasurementLabel.Hips, valueCm: 115.0, valueIn: 45.5 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 95.0, valueIn: 37.5 },
          { label: MeasurementLabel.Hips, valueCm: 120.0, valueIn: 47.5 },
        ],
      },
    ],
  },
  // WOMEN CARGO PANTS (same as WOMEN BAGGY JEANS)
  {
    type: ClothTypeName.WomenCargoPants,
    size: [
      {
        name: "S",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 70.0, valueIn: 27.5 },
          { label: MeasurementLabel.Hips, valueCm: 95.0, valueIn: 37.5 },
        ],
      },
      {
        name: "M",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 75.0, valueIn: 29.5 },
          { label: MeasurementLabel.Hips, valueCm: 100.0, valueIn: 39.5 },
        ],
      },
      {
        name: "L",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 80.0, valueIn: 31.5 },
          { label: MeasurementLabel.Hips, valueCm: 105.0, valueIn: 41.5 },
        ],
      },
      {
        name: "XL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 85.0, valueIn: 33.5 },
          { label: MeasurementLabel.Hips, valueCm: 110.0, valueIn: 43.5 },
        ],
      },
      {
        name: "XXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 90.0, valueIn: 35.5 },
          { label: MeasurementLabel.Hips, valueCm: 115.0, valueIn: 45.5 },
        ],
      },
      {
        name: "XXXL",
        measurement: [
          { label: MeasurementLabel.Waist, valueCm: 95.0, valueIn: 37.5 },
          { label: MeasurementLabel.Hips, valueCm: 120.0, valueIn: 47.5 },
        ],
      },
    ],
  },
];

export const Sizes: CountrySize[] = [
  {
    country: "GHANA",
    clothTypes: GhanaClothTypes,
  },
  {
    country: "USA",
    clothTypes: GhanaClothTypes, 
  },
  {
    country: "UK",
    clothTypes: GhanaClothTypes, 
  },
  {
    country: "France",
    clothTypes: GhanaClothTypes, // French sizes are comparable, with minor variations in fit.
  },
  {
    country: "Italy",
    clothTypes: GhanaClothTypes, // Italian sizes are similar to French.
  },
  {
    country: "Canada",
    clothTypes: GhanaClothTypes, // Canadian sizes match US standards.
  },
];
