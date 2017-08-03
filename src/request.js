/**
 * FritzBox.js
 * https://git.io/fritzbox
 * Licensed under the MIT License.
 * Copyright (c) 2017 Sander Laarhoven All Rights Reserved.
 */

let fritzRequest = {}

/**
 * Send a request to the Fritz!Box.
 * @param  {string} path    Path to request
 * @param  {string} method  Request method
 * @param  {object} options Options object
 * @return {promise}        Body of response
 */
fritzRequest.request = (path, method, options) => {
  return new Promise(function (resolve, reject) {
    options.protocol = options.protocol || 'GET'

    // Make sure we have the required options.
    if (!options.server || options.server === '') {
      // We should probably check for more config settings..
      return reject('Missing login config.')
    }

    if (typeof options.removeSidFromUri === 'undefined') {
      options.removeSidFromUri = false
    }

    // Add SID to path if one has been given to us.
    if (options.sid && !options.removeSidFromUri) {
      path += '&sid=' + options.sid
    }

    // Set the options for the request.
    const url = options.protocol + '://' + options.server + path;
    const requestOptions = {
      method: method || 'GET'
    }

    // Execute HTTP(S) request.
    fetch(url, requestOptions)
    .then(response =>
      response.text().then(body => {
        resolve({ body, statusCode: response.status });
      })
    )
    .catch((error) => {
      console.log('[FritzRequest] Request failed.')
      return reject(error)
    })
  })
}

/**
 * Find the cause of a failed request.
 * @param  {object} response HTTP request response
 * @return {string}          Detailed error message
 */
fritzRequest.findFailCause = (response) => {
  console.log('[FritzRequest] HTTP response code was ' + response.statusCode)

  if (response.statusCode === 403) {
    response.errorMsg = 'Not authenticated correctly for communication with Fritz!Box.'; 
  }

  if (response.statusCode === 500) {
    response.errorMsg = 'The Fritz!Box encountered an internal server error.'
  }

  if (response.statusCode === 404) {
    response.errorMsg = 'Requested page does not exist on the Fritz!Box.'
  }

  if (!response.errorMsg) {
    response.errorMsg = 'Encountered an unexpected error.';
  }

  return response;
}

/**
 * Export fritzRequest.
 */

module.exports = fritzRequest
