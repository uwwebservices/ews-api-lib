import { BaseWebService } from './common';
export interface UWWorker {
    IsFutureDate: boolean;
    EmployeeID: string;
    EmployeeIDPrior?: string;
    NetID: string;
    RegID: string;
    RepositoryTimeStamp: Date;
    DisplayFirstName: string;
    DisplayLastName: string;
    DisplayMiddleName?: string;
    DisplayName: string;
    FormattedLegalNameFirstLast: string;
    FormattedLegalNameFirstMiddleLast: string;
    FormattedLegalNameLastFirstMiddle: string;
    FormattedPreferredNameFirstLast: string;
    FormattedPreferredNameFirstMiddleLast: string;
    FormattedPreferredNameLastFirstMiddle: string;
    LegalFirstName: string;
    LegalMiddleName: string;
    LegalLastName: string;
    LegalNameSuffix?: string;
    PreferredFirstName: string;
    PreferredMiddleName?: string;
    PreferredLastName: string;
    PreferredNameSuffix?: string;
    IsCurrentFaculty: boolean;
    WorkdayPersonType: string;
    HuskyCardOverride?: boolean;
}
declare class HRPWebService extends BaseWebService {
    /**
     * Get information for a person via HRPWS.
     * @param identifier - The identifer (UWNetID or UWRegID) of the person to lookup
     * @returns Data representing a person or null
     */
    Get(identifier: string): Promise<UWWorker>;
}
declare const _default: HRPWebService;
export default _default;
