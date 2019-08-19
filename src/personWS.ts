import { BaseWebService } from './common';

export interface PWSSearchResult {
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

class PersonWebService extends BaseWebService {
  /**
   * Get information for a person.
   * @param identifier The identifer (UWNetID or UWRegID) of the person to lookup
   * @returns Data representing a person or null
   */
  public async Get(identifier: string, full: boolean = false): Promise<UWPerson | null> {
    if (full) {
      identifier = identifier + '/full';
    }

    try {
      return await this.MakeRequest<UWPerson>(`${this.Config.baseUrl}/person/${identifier}.json`);
    } catch (ex) {
      console.log('Get Error', ex.message);
      return null;
    }
  }

  /**
   * Get information for people.
   * @param identifiers The identifers (UWNetID or UWRegID) of the people to lookup
   * @param batchSize The size of the batch
   * @param key The key to use (uwnetid or uwregid)
   * @returns The information belonging to that people or null
   */
  public async GetMany(identifiers: string[], batchSize: number = 15, key: string = 'uwnetid') {
    let start = 0;
    let end = start + batchSize > identifiers.length ? identifiers.length : start + batchSize;
    const filtered: Array<UWPerson | null> = [];

    while (end <= identifiers.length) {
      let res = {
        Persons: [] as Array<UWPerson | null>
      };
      const ids = identifiers.slice(start, end);

      // Breakout if no members
      if (ids.length == 0) {
        break;
      }

      try {
        res = await this.MakeRequest<PWSSearchResult>(`${this.Config.baseUrl}/person.json?${key}=${ids.join(',')}&verbose=true`);
      } catch (ex) {
        console.log('GetMany Error', ex.message);
        for (let _ of ids) {
          res.Persons.push(null);
        }
      }
      console.log(res.Persons);
      for (let person of res.Persons) {
        filtered.push(person);
      }

      start = end;
      end = start + batchSize > identifiers.length ? identifiers.length : start + batchSize;
    }

    return filtered;
  }

  /**
   * PWS Search by query.
   * @param query The identifer (UWNetID or UWRegID) of the person to lookup
   * @param pageSize How large of a page (max: 250)
   * @param pageStart What page to start on
   * @returns Data representing a person or empty list
   */
  public async Search(query: string, pageSize: string = '10', pageStart: string = '1') {
    try {
      return await this.MakeRequest<PWSSearchResult>(`${this.Config.baseUrl}/person.json?${query}&page_size=${pageSize}&page_start=${pageStart}`);
    } catch (ex) {
      console.log('Search Error', ex.message);
      return { Persons: [], TotalCount: '', Size: '', PageStart: '' };
    }
  }
}

export default new PersonWebService();
