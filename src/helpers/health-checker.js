'use strict';

const axios = require('axios');

function allSettled (promises) {
  const wrappedPromises = promises.map(p => Promise.resolve(p)
    .then(
      val => ({ state: 'fulfilled', value: val }),
      err => ({ state: 'rejected', reason: err })
    )
  );

  return Promise.all(wrappedPromises);
}


module.exports = async healthChecks => {
  const checkPromises = [];

  (healthChecks || []).forEach(healthCheck => {
    let uri = `${healthCheck.protocol}://${healthCheck.host}`;

    if (healthCheck.port) {
      uri += `:${healthCheck.port}`;
    }

    uri += healthCheck.path;

    checkPromises.push(axios({
      url: uri,
      method: 'GET'
    }));
  });

  const checkResults = [];

  return allSettled(checkPromises).then(results => {
    results.forEach((result, index) => {
      const uri = `${healthCheck.protocol}://${healthCheck.host}`;
      if (healthCheck.port)  uri += `:${healthCheck.port}`;
      uri += healthCheck.path || '';
      const status = (result.state === 'rejected') ? 'failed' : 'ok';
      checkResults.push({ uri, status });
    });

    return checkResults;
  });
};
