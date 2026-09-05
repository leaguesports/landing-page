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
  cresta: [-26.131, 27.971],
  northriding: [-26.053, 27.944],
  strubensvalley: [-26.127, 27.904],
  "aspen-lakes": [-26.289, 28.05],
  greenstone: [-26.129, 28.145],
  "century-city": [-33.893, 18.512],
  "table-view": [-33.824, 18.49],
  bellville: [-33.872, 18.632],
  umhlanga: [-29.726, 31.066],
};

/** Default map center (Johannesburg) */
export const DEFAULT_MAP_CENTER: [number, number] = [-26.135, 28.065];
