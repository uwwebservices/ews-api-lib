import { BaseWebService } from './common';

export interface UWCard {
  Cards: {
    RegID: string;
  }[];
}

export enum PhotoSizes {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

class IDCardWebService extends BaseWebService {
  /**
   * Get the UWRegID of a person via the magstrip/rfid of their husky card
   * @param magstrip The magstrip of the card to lookup
   * @param rfid The rfid of the card to lookup
   * @returns The UWRegID of the person or an empty string
   */
  public async GetRegID(magstrip: string = '', rfid: string = '') {
    try {
      return (await this.MakeRequest<UWCard>(`${this.Config.baseUrl}/card.json?mag_strip_code=${magstrip}&prox_rfid=${rfid}`)).Cards[0].RegID as string;
    } catch (ex) {
      console.log('GetRegID Error', ex.message);
      return '';
    }
  }

  /**
   * Get the photo of a person via their UWRegID
   * @param regid The UWRegID of the person for which to fetch a photo
   * @param size The size of the photo to fetch (small, medium, large)
   * @returns The photo or null
   */
  public async GetPhoto(regid: string, size: PhotoSizes = PhotoSizes.Medium) {
    try {
      return Buffer.from(await this.MakeRequest(`${this.Config.baseUrl}/photo/${regid}-${size}.jpg`, 'GET', {}, 5000, null));
    } catch (ex) {
      console.log('GetPhoto Error', ex.message);
      return null;
    }
  }
}

export default new IDCardWebService();
