import { BaseWebService } from './common';
export declare enum UWAuthMode {
    Hops = "hops",
    Auths = "auths"
}
export interface UWAuthApplications {
    Applications: {
        ID: string;
        Name: string;
        RolesURI: {
            Href: string;
        };
    }[];
}
export interface UWAuthApplicationRoles {
    Application: string;
    Roles: {
        ID: string;
        Name: string;
    }[];
}
export interface UWAuthorizers {
    DisplayName: string;
    UWNetID: string;
    Application: string;
    Role: string;
    HasRole: boolean;
    Authorizers: {
        DisplayName: string;
        NetID: string;
        OrganizationCode: string;
        OrganizationDescription: string;
        CostCenter: {
            ID: string;
            Description: string;
        };
        Source: string;
        MatchedOrganizationCode: string;
        HopCount: number;
        Astra: {
            IsAlsoDelegator: boolean;
            AllAuthorizationsCount: number;
            SpecificAuthorizationsCount: number;
            RequestorAuthorizationsCount: number;
        };
        RelationshipDistance: number;
    }[];
    Relationships: {
        OrganizationCode: string;
        OrganizationDescription: string;
        Source: string;
        CostCenter: {
            ID: string;
            Description: string;
        };
        ParentOrganizations: {
            OrganizationCode: string;
            OrganizationDescription: string;
            HopCount: number;
        }[];
    }[];
}
declare class WhoCanWebService extends BaseWebService {
    /**
     * Get a list of applications.
     * @returns An array of applications or null
     */
    Applications(): Promise<UWAuthApplications>;
    /**
     * Get a list of roles for a given application.
     * @returns An array of application roles or null
     */
    Roles(app: string): Promise<UWAuthApplicationRoles>;
    /**
     * Get authorization information for a person.
     * @param identifier The identifer (UWNetID) of the person to lookup
     * @param app The application to lookup
     * @param role The role to lookup
     * @param mode The mode to use (default: hops)
     * @param limit The limit on the number of authorizers (default: 50)
     * @returns Data representing authorization information for a person or null
     */
    Get(identifier: string, app: string, role: string, mode?: UWAuthMode, hops?: number): Promise<UWAuthorizers>;
}
declare const _default: WhoCanWebService;
export default _default;
