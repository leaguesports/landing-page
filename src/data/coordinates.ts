/**
 * Approximate lat/lng for Johannesburg-area suburbs (for map pins).
 * Format: [latitude, longitude].
 */
export const SUBURB_COORDINATES: Record<string, [number, number]> = {
  sandton: [-26.107, 28.055],
  bryanston: [-26.099, 28.069],
  fourways: [-26.013, 28.003],
  rosebank: [-26.145, 28.041],
  roodepoort: [-26.163, 27.872],
  randburg: [-26.094, 28.001],
  midrand: [-26.011, 28.138],
  edenvale: [-26.14, 28.152],
  bedfordview: [-26.169, 28.152],
  kensington: [-26.203, 28.087],
  "moreleta-park": [-25.87, 28.26],
  morningside: [-26.133, 28.087],
  parkhurst: [-26.139, 28.067],
  illovo: [-26.131, 28.069],
  linksfield: [-26.156, 28.087],
  greenside: [-26.142, 28.042],
  modderfontein: [-26.089, 28.169],
};

/** Default map center (Johannesburg) */
export const DEFAULT_MAP_CENTER: [number, number] = [-26.135, 28.065];
