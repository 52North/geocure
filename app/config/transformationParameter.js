function get() {
  const supportedCRS = [
    [
      //WGS48
      'EPSG:4326',
      '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'
  ],
  [
      // NAD83
      'EPSG:4269',
      '+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees'
  ],
  [
      //ETRS89 / LCC Germany (E-N)
      'EPSG:5243',
      '+proj=longlat +ellps=intl +towgs84=162,117,154,0,0,0,0 +no_defs'
  ],
  [
      //ETRS89 / LCC Germany (N-E)
      'EPSG:4839',
      '+proj=longlat +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +no_defs'
  ],
  [
      //DHDN / Soldner Berlin
      'EPSG:3068',
      '+proj=cass +lat_0=52.41864827777778 +lon_0=13.62720366666667 +x_0=40000 +y_0=10000 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs'
  ],

  [
      //Pseudo-Mercator / Web-Mercator
      'EPSG:3857',
      '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs'
  ]

  ];

  return supportedCRS;
}


module.exports = {
  get : get
}
