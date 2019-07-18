import { WebServiceConfig } from './common';
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
declare const _default: {
    Config: WebServiceConfig;
    /**
     * Initial setup for PersonWS library
     * @param certificate
     * @param baseUrl
     */
    Setup(certificate: Pfx, baseUrl: string): void;
    /**
     * Get information for a person via PersonWS.
     * @param identifier The identifer (UWNetID or UWRegID) of the person to lookup
     * @returns Data representing a person or null
     */
    Get(identifier: string, full?: boolean): Promise<UWPerson>;
    /**
     * Get information for people via PersonWS.
     * @param identifiers The identifers (UWNetID or UWRegID) of the people to lookup
     * @param batchSize The size of the batch
     * @param key The key to use (uwnetid or uwregid)
     * @returns The information belonging to that people or null
     */
    GetMany(identifiers: string[], batchSize?: number, key?: string): Promise<UWPerson[]>;
    /**
     * PWS Search by query
     * @param query The identifer (UWNetID or UWRegID) of the person to lookup
     * @param pageSize How large of a page (max: 250)
     * @param pageStart What page to start on
     * @returns Data representing a person or empty list
     */
    Search(query: string, pageSize?: string, pageStart?: string): Promise<PWSSearchResult>;
};
export default _default;
