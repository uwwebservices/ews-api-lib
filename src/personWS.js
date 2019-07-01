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
   * Initial setup for PersonWS library
   * @param {import('./cert').Pfx} certificate
   * @param {string} baseUrl
   */
  Setup(certificate, baseUrl) {
    this.Config.certificate = certificate;
    this.Config.baseUrl = baseUrl;
  },

  /**
   * Get information for a person via PersonWS.
   * @param {string} identifier - The identifer (UWNetID or UWRegID) of the person to lookup
   * @returns {Promise<UWPerson>} - Data representing a person or null
   */
  async Get(identifier, full = false) {
    if (full) {
      identifier = identifier + '/full';
    }
    const request = this.CreateRequest(`${this.Config.baseUrl}/person/${identifier}.json`, this.Config.certificate);
    try {
      return await rp(request);
    } catch (ex) {
      console.log('Get Error', ex);
      return null;
    }
  },

  /**
   * Get information for people via PersonWS.
   * @param {string[]} identifiers - The identifers (UWNetID or UWRegID) of the people to lookup
   * @param {number} batchSize - The size of the batch
   * @param {string} key - The key to use (uwnetid or uwregid)
   * @returns {Promise<UWPerson[]>} - The information belonging to that people or null
   */
  async GetMany(identifiers, batchSize = 15, key = 'uwnetid') {
    let start = 0;
    let end = start + batchSize > identifiers.length ? identifiers.length : start + batchSize;
    /** @type {UWPerson[]} */
    const filtered = [];

    while (end <= identifiers.length) {
      let res = {
        /** @type {UWPerson[]} */
        Persons: []
      };
      const ids = identifiers.slice(start, end);
      const request = this.CreateRequest(`${this.Config.baseUrl}/person.json?${key}=${ids.join(',')}&verbose=true`, this.Config.certificate);

      // Breakout if no members
      if (ids.length == 0) {
        break;
      }

      try {
        res = await rp(request);
      } catch (ex) {
        console.log('GetMany Error', ex);
        for (let _ of ids) {
          res.Persons.push(null);
        }
      }

      for (let person of res.Persons) {
        filtered.push(person);
      }

      start = end;
      end = start + batchSize > identifiers.length ? identifiers.length : start + batchSize;
    }

    return filtered;
  },

  /**
   * PWS Search by query
   * @param {string} query - The identifer (UWNetID or UWRegID) of the person to lookup
   * @param {string} pageSize - How large of a page (max: 250)
   * @param {string} pageStart - What page to start on
   * @returns {Promise<UWPerson[]>} - Data representing a person or empty list
   */
  async Search(query, pageSize = '10', pageStart = '1') {
    // https://wseval.s.uw.edu/identity/v2/person.json?department=*NWH*&employeeAffiliationState=current
    const request = this.CreateRequest(`${this.Config.baseUrl}/person.json?${query}&PageSize=${pageSize}&PageStart=${pageStart}`, this.Config.certificate);
    let res = {
      /** @type {UWPerson[]} */
      Persons: []
    };

    try {
      res = await rp(request);
    } catch (ex) {
      console.log('Search Error', ex);
    }

    return res.Persons;
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

/** @typedef {{ UWNetID: string, UWRegID: string, DisplayName: string, EduPersonAffiliations: string[] }} UWPerson */
/** @typedef {{ certificate: import('./cert').Pfx, baseUrl: string }} Config */
/** @typedef {{ method: string, url: string, body: any, json: boolean, time: boolean, ca: string[], agentOptions: { pfx: string, passphrase: string, securityOptions: string }}} Request */
