// @ts-check
import rp from 'request-promise';

export default {
  /** @type {Config} */
  Config: {
    certificate: {
      pfx: null,
      passphrase: null,
      ca: null,
      incommon: null
    },
    baseUrl: '',
    fullResponse: false
  },

  /**
   * Initial setup for PersonWS library
   * @param {import('./cert').Pfx} certificate
   * @param {string} baseUrl
   */
  Setup(certificate, baseUrl, fullResponse = false) {
    this.Config.certificate = certificate;
    this.Config.baseUrl = baseUrl;
    this.Config.fullResponse = fullResponse;
  },

  /**
   * Get information for a person via PersonWS.
   * @param {string} identifier - The identifer (UWNetID or UWRegID) of the person to lookup
   * @returns {Promise<*>} - Data representing a person or null
   */
  async Get(identifier) {
    const request = this.CreateRequest(`${this.Config.baseUrl}/worker/${identifier}.json`, this.Config.certificate);
    try {
      return await rp(request);
    } catch (ex) {
      console.log('Get Error', ex);
      return null;
    }
  },

  /**
   * Default configuration for an API request
   * @param {string} url
   * @param {import('./cert').Pfx} certificate
   * @param {string} method
   * @param {any} body
   * @param {boolean} fullResponse
   * @returns {Request}
   */
  CreateRequest(url, certificate, method = 'GET', body = {}) {
    let options = {
      method,
      url,
      body,
      json: true,
      time: true,
      ca: [],
      agentOptions: {
        pfx: certificate.pfx,
        passphrase: certificate.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3'
      },
      resolveWithFullResponse: this.Config.fullResponse
    };
    if (certificate.ca) {
      options.ca.push(certificate.ca);
    }
    if (certificate.incommon) {
      options.ca.push(certificate.incommon);
    }
    return options;
  }
};

/** @typedef {{ UWNetID: string, UWRegID: string, DisplayName: string, EduPersonAffiliations: string[] }} UWPerson */
/** @typedef {{ certificate: import('./cert').Pfx, baseUrl: string, fullResponse: boolean }} Config */
/** @typedef {{ method: string, url: string, body: any, json: boolean, time: boolean, ca: string[], agentOptions: { pfx: string, passphrase: string, securityOptions: string }}} Request */
