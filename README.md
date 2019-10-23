# Ferrybox API

This repo serves as a simple demo of the Ferrybox API

## Token

In order to access the API, you'll need to aquire a token named "service-account-token.json" and place it in this folder

## prerequisites

the demo requires nodejs and npm. It was tested on node v10.1.0 and v10.16.3 (current LTS), but should probably work for most versions of node.

## Running

```
// first place service-account-token.json in this directory
npm install
node ferrybox-api-demo.js
```

This will query the ferrybox API on api.niva.no and get raw data from a hardcoded time period, (see ferrybox-api-demo.js):

```
const startTime = '2019-10-16T00:00:01+02:00';
const endTime = '2019-10-23T00:00:01+02:00';
```

See [below](#setting-time-range-in-query) for description of time parameters. 


# API description
API exposing timeseries and metadata about each timeserie.

## Available endpoints
```
https://api.niva.no/v1/vessels
https://api.niva.no/v1/details/[uuid]
https://api.niva.no/v1/metaflow?uuid=[uuidlist comma separated]
https://api.niva.no/v1/signal/[uuid]/[startDate]/[endDate]
```

## Authorization
Access to the API is restricted. In order to get access, contact us at cloud@niva.no.
Requests to the API needs to add a bearer token based on a JWT token. See ferrybox-api-demo.js for example.
 
Each API user may be restricted in terms of the following parameters:

- region
- startDate
- endDate
- signal uuids

If a query is made for something which is restricted (e.g. outside allowed region) then no data is returned.

The response will display the users' restriction in the header object, see [example below](#query-endpoint-get-v1signal).

## Output data format
The output from the all the endpoints are JSON.

For JSON responses the query parameters will also be returned to the caller in the root `"header"`
element of the response.
### Query endpoint (GET `v1/track`)
Example:

fetch track data for colorline fantasy (FA):
```
GET https://api.niva.no/v1/track/4d9ff393-25a3-47b8-aaf1-8fbbccfec3c3/2019-10-16T00:00:01+02:00/2019-10-23T00:00:01+02:00
```

response:
```
{
  "features": [
    {
      "geometry": {
        "coordinates": [
          [
            10.8006,
            55.6192
          ],
          [
            10.8307,
            55.5686
          ]
        ],
        "type": "LineString"
      },
      "properties": {
        "latitude": 55.6192,
        "longitude": 10.8006,
        "time": "2019-10-16T02:10:45"
      },
      "type": "Feature"
    },
    {
      "geometry": {
        "coordinates": [
          [
            10.8307,
            55.5686
          ],
          [
            10.8621,
            55.517
          ]
        ],
        "type": "LineString"
      },
      "properties": {
        "latitude": 55.5686,
        "longitude": 10.8307,
        "time": "2019-10-16T02:20:46"
      },
      "type": "Feature"
    }
  ],
  "type": "FeatureCollection",
  "id": "4d9ff393-25a3-47b8-aaf1-8fbbccfec3c3",
  "startDate": "2019-10-16T00:00:01+02:00",
  "endDate": "2019-10-23T00:00:01+02:00"
}

```

### Query endpoint (GET `v1/signal`)
End-points for time-series queries (time indexed sequence of values).

#### Example:

Fetch measurements for various timeseries:

```
    '4d9ff393-25a3-47b8-aaf1-8fbbccfec3c3', // FA/gpstrack
    '720b78cb-3e82-4c4d-9b63-7d1ae1b7afc1', // FA/raw/ferrybox/INLET_TEMPERATURE
    'd7d3c8c3-43f2-4881-bed3-63f03915ce9c', // FA/ferrybox/TURBIDITY
    '314cd400-14a7-489a-ab97-bce6b11ad068', // FA/ferrybox/CTD/SALINITY
    '2030a48e-024d-4f6a-a293-eb673321aaa2', // FA/ferrybox/CHLA_FLUORESCENCE/ADJUSTED
    'a10ff360-3b1e-4984-a26f-d3ab460bdb51'  // FA/ferrybox/CDOM_FLUORESCENCE/ADJUSTED
```

The gpstrack needs to be added to the query in order to get locations. Example:
```
GET https://api.niva.no/v1/signal/4d9ff393-25a3-47b8-aaf1-8fbbccfec3c3,720b78cb-3e82-4c4d-9b63-7d1ae1b7afc1,d7d3c8c3-43f2-4881-bed3-63f03915ce9c,314cd400-14a7-489a-ab97-bce6b11ad068,2030a48e-024d-4f6a-a293-eb673321aaa2,a10ff360-3b1e-4984-a26f-d3ab460bdb51/2019-10-16T00:00:01+02:00/2019-10-23T00:00:01+02:00?dt=0
```

The list of uuids needs to be commaseparated.

Response:
```
{
  "header": {
    "agg_type": "avg",
    "dt": "0",
    "end": "2019-10-23T00:00:01+02:00",
    "geofencing": "POLYGON((10.130042581236012%2059.97929522138169%2C10.954017190611012%2059.97929522138169%2C10.954017190611012%2059.22046495654814%2C10.130042581236012%2059.22046495654814%2C10.130042581236012%2059.97929522138169))",
    "start": "2019-10-16T00:00:01+02:00",
    "uuid": "4d9ff393-25a3-47b8-aaf1-8fbbccfec3c3,720b78cb-3e82-4c4d-9b63-7d1ae1b7afc1,d7d3c8c3-43f2-4881-bed3-63f03915ce9c,314cd400-14a7-489a-ab97-bce6b11ad068,2030a48e-024d-4f6a-a293-eb673321aaa2,a10ff360-3b1e-4984-a26f-d3ab460bdb51"
  },
  "t": [
    {
      "2030a48e-024d-4f6a-a293-eb673321aaa2": 2.085,
      "314cd400-14a7-489a-ab97-bce6b11ad068": 23.728,
      "720b78cb-3e82-4c4d-9b63-7d1ae1b7afc1": 13.064,
      "a10ff360-3b1e-4984-a26f-d3ab460bdb51": 0.5,
      "d7d3c8c3-43f2-4881-bed3-63f03915ce9c": 0.26,
      "latitude": 56.71,
      "longitude": 11.8249,
      "time": "2019-10-15T22:00:10"
    },
    {
      "2030a48e-024d-4f6a-a293-eb673321aaa2": 2.085,
      "314cd400-14a7-489a-ab97-bce6b11ad068": 23.711,
      "720b78cb-3e82-4c4d-9b63-7d1ae1b7afc1": 13.069,
      "a10ff360-3b1e-4984-a26f-d3ab460bdb51": 0.15,
      "d7d3c8c3-43f2-4881-bed3-63f03915ce9c": 0.21,
      "latitude": 56.7052,
      "longitude": 11.82,
      "time": "2019-10-15T22:01:10"
    },
    ...
    {
      "2030a48e-024d-4f6a-a293-eb673321aaa2": 2.175,
      "314cd400-14a7-489a-ab97-bce6b11ad068": 22.108,
      "720b78cb-3e82-4c4d-9b63-7d1ae1b7afc1": 12.228,
      "a10ff360-3b1e-4984-a26f-d3ab460bdb51": 0.55,
      "d7d3c8c3-43f2-4881-bed3-63f03915ce9c": 0.32,
      "latitude": 56.9479,
      "longitude": 11.7703,
      "time": "2019-10-22T21:58:50"
    }
  ],
  "id": "4d9ff393-25a3-47b8-aaf1-8fbbccfec3c3,720b78cb-3e82-4c4d-9b63-7d1ae1b7afc1,d7d3c8c3-43f2-4881-bed3-63f03915ce9c,314cd400-14a7-489a-ab97-bce6b11ad068,2030a48e-024d-4f6a-a293-eb673321aaa2,a10ff360-3b1e-4984-a26f-d3ab460bdb51",
  "startDate": "2019-10-16T00:00:01+02:00",
  "endDate": "2019-10-23T00:00:01+02:00"
}
```


### misc

Important features:
1. By default all returned time series will be _time aggregated_.
   This allows for bandwidth savings and responsive interactive drill-ins
   for large time series. The default number of data points returned is ~1000,
   this can be overridden by setting the `n` parameter or `dt` parameter in
   the query.
   The API support different types of aggregation, aritmetic average is the
   default for normal time series and mode is the default for flags.
   Raw data is returned if `dt=0` is set.
   For more information see description of query parameters bellow.
1. For normal time series queries are _filtered on the data quality_ flag,
   meaning that only data points which has passed QC is included in the
   returned result. This behavioyur can be overriden using the `noqc` query
   flag.
1. If a GPS-track is included in the query _data is merged with the track_,
   and the GPS-track data is returned as `longitude` and `latitude`.
     1. Only one GPS-track can be submitted at the time
     1. Aggregation level is forced to the GPS-track, with actual
        GPS-track time stamps.


The end point expect/accept the following parameters:
* Time range for the query, can be given in different ways (see bellow), default is the last week
* n (integer): approximate number of data-points to return from the query
* dt (string or flaot): time span for time aggregation of query. Must be a valid ISO8601 time span string
  (without begin and end time) like "P1D4H" or a float with the number of seconds in the time
  aggregation window.
  Also note that the API don't guarantee that the returned time spans will match the requested string, it will just try to
  match it as close as possible with a valid Timescale [time aggregation string](http://docs.timescale.com/latest/api#select).
  For more information about ISO8601 time spans see [https://en.wikipedia.org/wiki/ISO_8601#Durations](https://en.wikipedia.org/wiki/ISO_8601#Durations)
* agg (string): aggregation function for time series data valid types are:
  ("avg", "min", "max", "sum", "count", "stddev", "mode", "median", "percentile").
* percentile (float): fraction for percentile calculation, float between 0 and 1,
  if agg=percentile this parameter must be included

#### Setting time range in query
The parameters used to set the time range in a query are:
* `start` (start time of query)
* `end` (end time of query)
* `ts` (time span of query)

All timestamps and time spans are assumed to be ISO8601 formatted string, with
one exception: "end=now" which will force end-time into datetime.utcnow()
 
Time intervals can be expressed in several ways with a combination of the three parameters:
1. As an ISO8601 time interval ("ts") parameter with start and end time. Examples: `ts=2007-03-01T13:00:00Z/2008-05-11T15:30:00Z
                 ts=P1Y2M10DT2H30M/2008-05-11T15:30:00Z`
2. As explicit start and end parameters (ISO8601 formatted)
       Example: start=2017-01-01T00:10:10.82812
                end=2017-02-01T10:21:33.15
3. As a time interval parameter ("ts") and either a corresponding
       "start" or "end" parameter or implicit end=now by omitting 
       start/end parameters.
       Example: ts=PT1H10M10.03S
                end=2013-10-12T10
       Example: ts=P1M

Also note that the API has the following default behavior:
1. If start and end parameters are both given any given "ts" parameter will be ignored 
2. If no parameters are given the function will return one week ending now
3. If only a time span (without start or end) are given end time is set to now


Standard JSON formatted time series data:
```json
{
  "t": [
    {
      "ef4a44ce-cb47-45d9-aced-26f4e08fb5b8": 102.03, 
      "time": "2016-12-31T04:00:00"
    }, 
    {
      "ef4a44ce-cb47-45d9-aced-26f4e08fb5b8": 102.03, 
      "time": "2016-12-31T09:00:00"
    }, 
    {
      "ef4a44ce-cb47-45d9-aced-26f4e08fb5b8": 102.03, 
      "time": "2016-12-31T14:00:00"
    }
  ]
}
```

GeoJSON output for path data:
```json
{
  "features": [
    {
      "geometry": {
        "coordinates": [
          [
            10.141, 
            54.318
          ], 
          [
            10.141, 
            54.318
          ]
        ], 
        "type": "LineString"
      }, 
      "properties": {
        "latitude": 54.318, 
        "longitude": 10.141, 
        "time": "2017-01-01T00:00:44"
      }, 
      "type": "Feature"
    }, 
    {
      "geometry": {
        "coordinates": [
          [
            10.141, 
            54.318
          ], 
          [
            10.141, 
            54.318
          ]
        ], 
        "type": "LineString"
      }, 
      "properties": {
        "latitude": 54.318, 
        "longitude": 10.141, 
        "time": "2017-01-01T01:03:48"
      }, 
      "type": "Feature"
    } 
  ], 
  "type": "FeatureCollection"
}
```