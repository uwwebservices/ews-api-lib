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
declare class PersonWebService extends BaseWebService {
    /**
     * Get information for a person.
     * @param identifier The identifer (UWNetID or UWRegID) of the person to lookup
     * @returns Data representing a person or null
     */
    Get(identifier: string, full?: boolean): Promise<UWPerson | null>;
    /**
     * Get information for people.
     * @param identifiers The identifers (UWNetID or UWRegID) of the people to lookup
     * @param batchSize The size of the batch
     * @param key The key to use (uwnetid or uwregid)
     * @returns The information belonging to that people or null
     */
    GetMany(identifiers: string[], batchSize?: number, key?: string): Promise<UWPerson[]>;
    /**
     * PWS Search by query.
     * @param query The identifer (UWNetID or UWRegID) of the person to lookup
     * @param pageSize How large of a page (max: 250)
     * @param pageStart What page to start on
     * @returns Data representing a person or empty list
     */
    Search(query: string, pageSize?: string, pageStart?: string): Promise<PWSSearchResult>;
}
declare const _default: PersonWebService;
export default _default;
