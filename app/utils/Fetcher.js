// For now, we expect all requests and responses with the API server to be in JSON format
const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

/**
 * Performs a GET request using Fetch. The options parameter takes any options
 * supported by the Fetch API. One required property of the options object is url,
 * which is the resource to fetch.
 * @param  {Object} options     Options supported by Fetch
 * @param  {String} options.url Resource to fetch
 * @return {Promise} Resolves with the Response returned by Fetch
 */
const get = options => fetch(options.url, {
  ...options,
  method: 'GET',
  headers: Object.assign({}, headers, options.headers),
});

/**
 * Performs a POST request using Fetch. The options parameter takes any options
 * supported by the Fetch API. One required property of the options object is url,
 * which is the resource to fetch.
 * @param  {Object} options     Options supported by Fetch
 * @param  {String} options.url Resource to fetch
 * @return {Promise} Resolves with the Response returned by Fetch
 */
const post = options => fetch(options.url, {
  ...options,
  method: 'POST',
  headers: Object.assign({}, headers, options.headers),
});

export default { get, post };
