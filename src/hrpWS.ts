import rp from 'request-promise';
import { WebServiceConfig, CreateRequest } from './common';
import { Pfx } from './cert';

export default {
  Config: {
    certificate: {
      pfx: null,
      passphrase: null,
      ca: null,
      incommon: null
    },
    baseUrl: ''
  } as WebServiceConfig,

  /**
   * Initial setup for HRPWS library
   * @param certificate
   * @param baseUrl
   */
  Setup(certificate: Pfx, baseUrl: string) {
    this.Config.certificate = certificate;
    this.Config.baseUrl = baseUrl;
  },

  /**
   * Get information for a person via HRPWS.
   * @param identifier - The identifer (UWNetID or UWRegID) of the person to lookup
   * @returns Data representing a person or null
   */
  async Get(identifier: string) {
    const request = CreateRequest(`${this.Config.baseUrl}/worker/${identifier}.json`, this.Config.certificate);
    try {
      return await rp(request);
    } catch (ex) {
      console.log('Get Error', ex);
      return null;
    }
  }
};
