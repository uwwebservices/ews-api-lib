import rp from 'request-promise';
import { WebServiceConfig, CreateRequest } from './common';
import { Pfx } from './cert';

interface PWSSearchResult {
  Persons: UWPerson[];
  TotalCount: string;
  Size: string;
  PageStart: string;
}

export interface UWPerson {
  UWNetID: string;
  UWRegID: string;
  DisplayName: string;
  EduPersonAffiliations: string[];
  PersonURI: {
    UWNetID: string;
  };
}

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
   * Initial setup for PersonWS library
   * @param certificate
   * @param baseUrl
   */
  Setup(certificate: Pfx, baseUrl: string) {
    this.Config.certificate = certificate;
    this.Config.baseUrl = baseUrl;
  },

  /**
   * Get information for a person via PersonWS.
   * @param identifier The identifer (UWNetID or UWRegID) of the person to lookup
   * @returns Data representing a person or null
   */
  async Get(identifier: string, full: boolean = false): Promise<UWPerson | null> {
    if (full) {
      identifier = identifier + '/full';
    }
    const request = CreateRequest(`${this.Config.baseUrl}/person/${identifier}.json`, this.Config.certificate);
    try {
      return await rp(request);
    } catch (ex) {
      console.log('Get Error', ex);
      return null;
    }
  },

  /**
   * Get information for people via PersonWS.
   * @param identifiers The identifers (UWNetID or UWRegID) of the people to lookup
   * @param batchSize The size of the batch
   * @param key The key to use (uwnetid or uwregid)
   * @returns The information belonging to that people or null
   */
  async GetMany(identifiers: string[], batchSize: number = 15, key: string = 'uwnetid') {
    let start = 0;
    let end = start + batchSize > identifiers.length ? identifiers.length : start + batchSize;
    const filtered: UWPerson[] = [];

    while (end <= identifiers.length) {
      let res = {
        Persons: [] as UWPerson[]
      };
      const ids = identifiers.slice(start, end);
      const request = CreateRequest(`${this.Config.baseUrl}/person.json?${key}=${ids.join(',')}&verbose=true`, this.Config.certificate);

      // Breakout if no members
      if (ids.length == 0) {
        break;
      }

      try {
        res = await rp(request);
      } catch (ex) {
        console.log('GetMany Error', ex);
        for (let _ of ids) {
          res.Persons.push({} as UWPerson);
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
   * @param query The identifer (UWNetID or UWRegID) of the person to lookup
   * @param pageSize How large of a page (max: 250)
   * @param pageStart What page to start on
   * @returns Data representing a person or empty list
   */
  async Search(query: string, pageSize: string = '10', pageStart: string = '1') {
    const request = CreateRequest(`${this.Config.baseUrl}/person.json?${query}&page_size=${pageSize}&page_start=${pageStart}`, this.Config.certificate);
    let res = {
      Persons: [],
      TotalCount: '',
      Size: '',
      PageStart: ''
    } as PWSSearchResult;

    try {
      res = await rp(request);
    } catch (ex) {
      console.log('Search Error', ex);
    }

    return res;
  }
};
