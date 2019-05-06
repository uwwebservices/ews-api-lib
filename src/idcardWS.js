// @ts-check
import rp from 'request-promise';

export default {
  /** @type {Config} */
  Config: {
    certificate: {
      pfx: null,
      passphrase: null,
      ca: null
    },
    baseUrl: ''
  },

  /**
   * Initial setup for IdCardWS library
   * @param {import('./cert').Pfx} certificate
   * @param {string} baseUrl
   */
  Setup(certificate, baseUrl) {
    this.Config.certificate = certificate;
    this.Config.baseUrl = baseUrl;
  },

  /**
   * Get the UWRegID of a person via the magstrip/rfid of their husky card
   * @param {string} magstrip - The magstrip of the card to lookup
   * @param {string} rfid - The rfid of the card to lookup
   * @returns {Promise<string>} - The UWRegID of the person or an empty string
   */
  async Get(magstrip = '', rfid = '') {
    const request = this.CreateRequest(`${this.Config.baseUrl}/card.json?mag_strip_code=${magstrip}&prox_rfid=${rfid}`, this.Config.certificate);

    try {
      return (await rp(request)).Cards[0].RegID;
    } catch (ex) {
      console.log('GetCard Error', ex);
      return '';
    }
  },

  /**
   * Get the photo of a person via their UWRegID
   * @param {string} regid The UWRegID of the person for which to fetch a photo
   * @param {string} size The size of the photo to fetch (small, medium, large)
   * @returns {Promise<Buffer>} The photo or null
   */
  async GetPhoto(regid, size = 'medium') {
    const request = this.CreateRequest(`${this.Config.baseUrl}/photo/${regid}-${size}.jpg`, this.Config.certificate);

    try {
      let res = await rp(request);
      return Buffer.from(res);
    } catch (ex) {
      console.log(`Error fetching photo: ${ex}`);
      return null;
    }
  },

  /**
   * Default configuration for an API request
   * @param {string} url
   * @param {import('./cert').Pfx} certificate
   * @param {string} method
   * @param {any} body
   * @returns {Request}
   */
  CreateRequest(url, certificate, method = 'GET', body = {}) {
    return {
      method,
      url,
      body,
      json: true,
      time: true,
      ca: [certificate.ca],
      agentOptions: {
        pfx: certificate.pfx,
        passphrase: certificate.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3'
      }
    };
  }
};

/** @typedef {{ certificate: import('./cert').Pfx, baseUrl: string }} Config */
/** @typedef {{ method: string, url: string, body: any, json: boolean, time: boolean, ca: string[], agentOptions: { pfx: string, passphrase: string, securityOptions: string }}} Request */
