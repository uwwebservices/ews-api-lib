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
   * Initial setup for IdCardWS library
   * @param certificate
   * @param baseUrl
   */
  Setup(certificate: Pfx, baseUrl: string) {
    this.Config.certificate = certificate;
    this.Config.baseUrl = baseUrl;
  },

  /**
   * Get the UWRegID of a person via the magstrip/rfid of their husky card
   * @param magstrip The magstrip of the card to lookup
   * @param rfid The rfid of the card to lookup
   * @returns The UWRegID of the person or an empty string
   */
  async GetRegID(magstrip: string = '', rfid: string = '') {
    const request = CreateRequest(`${this.Config.baseUrl}/card.json?mag_strip_code=${magstrip}&prox_rfid=${rfid}`, this.Config.certificate);

    try {
      return (await rp(request)).Cards[0].RegID as string;
    } catch (ex) {
      console.log('GetRegID Error', ex);
      return '';
    }
  },

  /**
   * Get the photo of a person via their UWRegID
   * @param regid The UWRegID of the person for which to fetch a photo
   * @param size The size of the photo to fetch (small, medium, large)
   * @returns The photo or null
   */
  async GetPhoto(regid: string, size: string = 'medium') {
    const request = CreateRequest(`${this.Config.baseUrl}/photo/${regid}-${size}.jpg`, this.Config.certificate);

    try {
      return Buffer.from(await rp(request));
    } catch (ex) {
      console.log('GetPhoto Error', ex);
      return null;
    }
  }
};
