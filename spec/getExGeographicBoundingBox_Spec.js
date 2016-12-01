const getExBBOX = require("../app/wms/maps.js");
const validCapabilities = require("./expetedWMSGetCapabilities.js");

describe("getExGeographicBoundingBox", () => {
  it("returns for valid capabilities the expected object", done => {
    const response = getExBBOX.getExGeographicBoundingBox({"capabilities": validCapabilities.get()});

    const expected = { TYPE_NAME : 'WMS_1_3_0.EXGeographicBoundingBox', westBoundLongitude : 6.8747774686921925, eastBoundLongitude : 6.895382390517432, southBoundLatitude : 51.54972640706632, northBoundLatitude : 51.564444208370055, "crs": "EPSG:4326" };
    expect(response).toEqual(expected);
    done();
  });
})
