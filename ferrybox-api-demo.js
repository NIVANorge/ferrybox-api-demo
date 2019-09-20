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
    '4d9ff393-25a3-47b8-aaf1-8fbbccfec3c3',
    '720b78cb-3e82-4c4d-9b63-7d1ae1b7afc1',
    '6d2fae2d-251c-474d-8a3f-25556cf24ecb',
    'd7d3c8c3-43f2-4881-bed3-63f03915ce9c',
    '314cd400-14a7-489a-ab97-bce6b11ad068',
    'e03fba93-1fed-49c2-ac5a-601dc2475915',
    '2030a48e-024d-4f6a-a293-eb673321aaa2',
    'a10ff360-3b1e-4984-a26f-d3ab460bdb51'
];
const startTime = '2018-02-19T00:00:01+02:00';
const endTime = '2018-02-20T00:00:01+02:00';

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

Promise.all([
    fetchMetadata(signalsUuids),
    fetchSignals(signalsUuids, startTime, endTime)
])
    .then(([metadata, signals]) => {
        const signalsMapped = signals.map((signal) => addPathToSignals(metadata, signal));
        console.log(signalsMapped)
    });

