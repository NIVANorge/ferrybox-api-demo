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
 
All objects in NIVA's meta data system has unique identifiers in the form
of [UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier),
this includes time series. In order to fetch or insert time series data 
user have to supply one or more valid UUIDs.

## Output data format
The default output from the all the endpoints are JSON.
And if there request is answered without error the root data element is always `"t"`,
the query endpoint can also return data in `geo-json`, `csv`, and Microsoft `Excel` format.

For JSON responses the query parameters will also be returned to the caller in the root `"header"`
element of the response.

#### Query endpoint (GET `v1/signal`)
End-points for time-series queries (time indexed sequence of values). The underlying database and the
API supports three types of time series: Numerical time-series with quality control, flags and data quality
time series (single integer value and no qulaity flag), and GPS-tracks which are time-series where each
time stamp have both longitude and latitude value.

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
* type (string): return type of the query, "json" (default), "geojson", "csv", and "excel" is currently supported,
"json" is the default. "geojson" is only valid if one of the passed uuids is for a gpstrack.
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
* noqc (flag, true if included): flag to ignore the Data Quality flag in the query. If not included only data which has passed
  the data quality check will be returned. 
* region (WKT string): Only return data from inside a given geographical region.
  The argument must be a region (polygon) defined as a
  [WKT](https://en.wikipedia.org/wiki/Well-known_text) string where the
  coordinates are assumed to be in [WGS84](https://en.wikipedia.org/wiki/World_Geodetic_System)
  format.
  Also note: if a region is supplied the query _must also include_ a uuid for an existing GPS track.

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

csv formatted time series data (UUIDs in header):
```csv
time,c23476c2-4a77-4def-bdf8-baa8669e54ab,e03fba93-1fed-49c2-ac5a-601dc2475915
2017-02-19 00:00:00,394.41975,97.819
2017-02-19 02:00:00,389.975042016807,97.1408403361345
2017-02-19 04:00:00,384.841583333333,96.2420833333334
2017-02-19 06:00:00,382.468833333333,93.6714166666667
2017-02-19 08:00:00,373.506916666667,96.4565
2017-02-19 10:00:00,360.409916666667,106.669916666667
2017-02-19 12:00:00,272.821932773109,76.0510084033614
```
Excel data is formatted in a similar way as csv.