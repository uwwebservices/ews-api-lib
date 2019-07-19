import rp from 'request-promise';
import { BaseWebService } from './common';

class HRPWebService extends BaseWebService {
  /**
   * Get information for a person via HRPWS.
   * @param identifier - The identifer (UWNetID or UWRegID) of the person to lookup
   * @returns Data representing a person or null
   */
  public async Get(identifier: string) {
    const request = this.CreateRequest(`${this.Config.baseUrl}/worker/${identifier}.json`, this.Config.certificate);
    try {
      return await rp(request);
    } catch (ex) {
      console.log('Get Error', ex);
      return null;
    }
  }
}

export default new HRPWebService();
