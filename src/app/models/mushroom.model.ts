export interface Mushroom {
  root: number[];
  stalkEnd: number[];
  stalkCurvePoint: number[];
  capCircle: MushroomCircle;
  capBase: MushroomCircle;
  capTop: number[];
  stalkBaseRadius: number;
}

export interface MushroomCircle {
  center: number[];
  radius: number;
}