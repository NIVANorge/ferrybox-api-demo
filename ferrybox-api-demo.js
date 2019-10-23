const jwt = require('jsonwebtoken');
const fetch = require('isomorphic-fetch');

const privateToken = require('./service-account-token.json');

const token = jwt.sign({
    iss: privateToken.client_email,
    sub: privateToken.client_email,
    aud: "api.niva.no",
    email: privateToken.client_email
}, privateToken.private_key, {algorithm: 'RS256'});

const signalsUuids = [
    '4d9ff393-25a3-47b8-aaf1-8fbbccfec3c3', // FA/gpstrack
    '720b78cb-3e82-4c4d-9b63-7d1ae1b7afc1', // FA/raw/ferrybox/INLET_TEMPERATURE
    'd7d3c8c3-43f2-4881-bed3-63f03915ce9c', // FA/ferrybox/TURBIDITY
    '314cd400-14a7-489a-ab97-bce6b11ad068', // FA/ferrybox/CTD/SALINITY
    '2030a48e-024d-4f6a-a293-eb673321aaa2', // FA/ferrybox/CHLA_FLUORESCENCE/ADJUSTED
    'a10ff360-3b1e-4984-a26f-d3ab460bdb51'  // FA/ferrybox/CDOM_FLUORESCENCE/ADJUSTED
];
const startTime = '2019-10-16T00:00:01+02:00';
const endTime = '2019-10-23T00:00:01+02:00';

const fetchMetadata = async (uuids) => {
    return fetch(`https://api.niva.no/v1/metaflow?uuid=${uuids.join(',')}`, {
        headers: {
            Authorization: 'Bearer ' + token
        }
    }).then(response => {
        return response.json();
    }).then(data => {
        return data.t;
    })
};

const fetchSignals = async (uuids, start, end) => {
    return fetch(`https://api.niva.no/v1/signal/${uuids.join(',')}/${start}/${end}?dt=0`, {
        headers: {
            Authorization: 'Bearer ' + token
        }
    }).then(response => {
        return response.json();
    }).then(data => {
        return data.t;
    })
};

const fetchTrack = async (uuid, start, end) => {
     return fetch(`https://api.niva.no/v1/track/${uuid}/${start}/${end}`, {
        headers: {
            Authorization: 'Bearer ' + token
        }
    }).then(response => {
        return response.json();
    });
};

const addPathToSignals = (metadata, signal) => {
  /**
   * Maps in metadata to each signal, instead of dealing with uuids
   */
  const metadataUuids = metadata.map(metadata => metadata.uuid);
    const uuids = Object.keys(signal).filter(key => metadataUuids.includes(key));
    const measurements = Object.entries(signal)
        .filter(([uuid, _]) => uuids.includes(uuid))
        .map(([uuid, value]) => {
            return {
                path: metadata.find(m => m.uuid === uuid).path,
                value: value,
            }
        });


    return {
        latitude: signal.latitude,
        longitude: signal.longitude,
        time: signal.time,
        measurements: measurements
    };
};

// fetch measurement data
Promise.all([
    fetchMetadata(signalsUuids),
    fetchSignals(signalsUuids, startTime, endTime)
])
    .then(([metadata, signals]) => {
        const signalsMapped = signals.map((signal) => addPathToSignals(metadata, signal));
        // do something with signals list here..
        console.log(signalsMapped);
    });


// fetch track for color fantasy
fetchTrack('4d9ff393-25a3-47b8-aaf1-8fbbccfec3c3', startTime, endTime)
    .then(response => {
        console.log(response)
    });

