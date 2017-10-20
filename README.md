# 52°North geocure

_geocure_ is a REST API providing proxified access to an underlying geodata
server. Currently [geoserver](http://geoserver.org/) in version 10.11-beta (for exceptions in JSON-Format) is supported.

The development of geocure was performed as part of the COLABIS
project ([https://colabis.de](http://geoserver.org/)).
![Alt text](https://colabis.de/images/bmbf_logo_en.png "bmbf_logo")
![Alt text](https://colabis.de/images/Logo_En.png "Colabis Logo")

The documentation of _geocure_ can be found here: [http://52north.github.io/geocure/](http://52north.github.io/geocure/)
## What it does

_gecure_ is placed between the used Geoserver and the client.
Using _geocure_, WM- and WF-Services can be accessed by a comfortable REST API. 
This facilitates not only the exploration of and access to data.
From a developers point of view, it simplifies the development of clients.
![Alt text](/geocure_pattern.png?raw=true "geocure facilitates requests")


### Example interaction
The following examples illustrate how easily one can interact with a geodata provider through the REST interface.

The `/services` endpoint gives an overview of the provided mapping services.

The following example shows that one access point to geodata is provided. Its id is _colabis-geoserver_. 
```json
[
    {
        "id": "colabis-geoserver",
        "label": "Colabis Geoserver",
        "description": "Offers data of the Colabis project",
        "href": "http://colabis.dev.52north.org/geocure/services/colabis-geoserver"
    }
]
```

Following this uri (href), the client gets further information about the resource.
The capabilities contain information about the accessible datatypes. 
In the example, map (raster data) and features (vector data) are supported.
```json
{
    "id": "colabis-geoserver",
    "label": "Colabis Geoserver",
    "description": "Offers data of the Colabis project",
    "capabilities": {
        "map": "http://colabis.dev.52north.org/geocure/services/colabis-geoserver/map",
        "features": "http://colabis.dev.52north.org/geocure/services/colabis-geoserver/features"
    }
}
```

Choosing the uri for features, an overview informs us about all accessible vector data.  Using their title, they can be easily filtered.
The _crs_ provides information about the area, covered by all features.

```json
{
    "features": [
        {
            "id": "_c8b2d332_2019_4311_a600_eefe94eb6b54",
            "title": "Heavy Metal Samples",
            "href": "http://colabis.dev.52north.org/geocure/services/colabis-geoserver/features/_c8b2d332_2019_4311_a600_eefe94eb6b54/data"
        },
        {
            "id": "_2518529a_fbf1_4940_8270_a1d4d0fa8c4d",
            "title": "dwd-kreise",
            "href": "http://colabis.dev.52north.org/geocure/services/colabis-geoserver/features/_2518529a_fbf1_4940_8270_a1d4d0fa8c4d/data"
        },
        {
            "id": "_9f064e17_799e_4261_8599_d3ee31b5392b",
            "title": "emission-simulation",
            "href": "http://colabis.dev.52north.org/geocure/services/colabis-geoserver/features/_9f064e17_799e_4261_8599_d3ee31b5392b/data"
        },
        {
            "id": "_d6bea91f_ac86_4990_a2d5_c603de92e22c",
            "title": "street-cleaning",
            "href": "http://colabis.dev.52north.org/geocure/services/colabis-geoserver/features/_d6bea91f_ac86_4990_a2d5_c603de92e22c/data"
        },
        {
            "id": "_7f1cce1a_62b3_49f3_ac3f_cf73ed1586fa",
            "title": "urban-atlas-2006-dresden",
            "href": "http://colabis.dev.52north.org/geocure/services/colabis-geoserver/features/_7f1cce1a_62b3_49f3_ac3f_cf73ed1586fa/data"
        },
        {
            "id": "_b2fa0f61_6578_493d_815b_9bd8cfeb2313",
            "title": "warning-shapes-coarse",
            "href": "http://colabis.dev.52north.org/geocure/services/colabis-geoserver/features/_b2fa0f61_6578_493d_815b_9bd8cfeb2313/data"
        },
        {
            "id": "_53fbae20_e2fb_4fd1_b5d6_c798e11b96d1",
            "title": "warning-shapes-fine",
            "href": "http://colabis.dev.52north.org/geocure/services/colabis-geoserver/features/_53fbae20_e2fb_4fd1_b5d6_c798e11b96d1/data"
        }
    ],
    "crs": {
        "TYPE_NAME": "WFS_2_0.FeatureTypeType",
        "westBoundLongitude": 5.86599881341562,
        "eastBoundLongitude": 15.037743335938,
        "southBoundLatitude": 47.270362,
        "northBoundLatitude": 55.057374701071,
        "crs": "EPSG:4326"
    }
}
```
The responses from above endpoints contain the whole layer. As this would use to much space on this page, you will be introduced to one provided filter functionality. Using bbox as a query parameter,  the client can define the extent of the requested area:

`[...]features/_c8b2d332_2019_4311_a600_eefe94eb6b54/data?bbox=50.000362,13.7099881341562,51.004362,13.9599881341562`

```json

{
    "type": "FeatureCollection",
    "totalFeatures": 12,
    "features": [
        {
            "type": "Feature",
            "id": "_c8b2d332_2019_4311_a600_eefe94eb6b54.fid-46fecec2_15f0581a076_fad",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    13.726043,
                    51.003874
                ]
            },
            "geometry_name": "Shape",
            "properties": {
                "X": 51.003874,
                "Y": 13.726043,
                "Timestamp": "2012-07-20T07:00:00Z",
                "Place": "Bannewitz",
                "Zn_1000_-_400___micro_g_per_g_": 127.3936706,
                "Zn_400_-_100___micro_g_per_g_": 418.9342066,
                "Zn_100_-_63___micro_g_per_g_": 743.5718278,
                "Zn_63_-_0.45___micro_g_per_g_": 528.2146161,
                "Zn_SUMM___micro_g_per_g_": 377.8245751,
                "Cu_1000_-_400___micro_g_per_g_": 48.0749849,
                "Cu_400_-_100___micro_g_per_g_": 112.1762429,
                "Cu_100_-_63___micro_g_per_g_": 164.8965903,
                "Cu_63_-_0.45___micro_g_per_g_": 151.0506145,
                "Cu_SUMM___micro_g_per_g_": 105.0860617,
                "Cd_1000_-_400___micro_g_per_g_": 0.056641806,
                "Cd_400_-_100___micro_g_per_g_": 0.166999107,
                "Cd_100_-_63___micro_g_per_g_": 0.264253773,
                "Cd_63_-_0.45___micro_g_per_g_": 0.278181578,
                "Cd_SUMM___micro_g_per_g_": 0.1663264
            }
        }
    ],
    "crs": {
        "type": "name",
        "properties": {
            "name": "urn:ogc:def:crs:EPSG::4326"
        }
    }
}

```



## Installation

`npm install`

## Configuration
To configure the service, only one file has to be changed ([./app/config/services.json](./app/config/services.json)).

```json
[
    {
        "id" : "local01",
        "label" : "Local Testservice",
        "description" : "Offers data (points and areas) for development.",
        "url" : "https://urlToService/geoserver",
        "capabilities" : {
            "map" : {
                "enabled" : true,
                "defaultvalues" : {
                    "width" : 1330,
                    "height" : 944,
                    "format" : "image/png"
                }

            },
            "features" : {
                "enabled" : true,
                "defaultvalues" : {
                    "format" : "application/json"
                }
            }
        }
    }
]
```

All configurations are carried out in this services.json. In this file an array is used to aggregate objects. Each object is used to described an offered service. An offered service is a service which is offered by the used Geoserver.

The documentation for the configuration ([http://52north.github.io/geocure/#configuration](http://52north.github.io/geocure/#configuration)) describes the keys in detail.
## Execution

`grunt nodemon` or `node app/server.js`

## Deployment with forever

Install [forever](https://github.com/foreverjs/forever)  and
[forever-service](https://github.com/zapty/forever-service) globally:

`[sudo] npm install forever -g`

`[sudo] npm install forever-service -g`

Create a startup script, with the root of the project as CWD:

`[sudo] forever-service install -s app/server.js geocure-forever`

Now, geocure should start as a daemon process when the machine is booted.

## Tests

Unit tests are executed by default `grunt`.

## License

[MIT License](./LICENSE.md)

## Disclaimer

THIS DOCUMENT IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
DOCUMENT, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
