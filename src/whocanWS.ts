import { BaseWebService } from './common';

export enum UWAuthMode {
  Hops = 'hops',
  Auths = 'auths'
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

const WhoCanTimeout = 5527;

class WhoCanWebService extends BaseWebService {
  /**
   * Get a list of applications.
   * @returns An array of applications or null
   */
  public async Applications() {
    try {
      return await this.MakeRequest<UWAuthApplications>(`${this.Config.baseUrl}/applications.json`);
    } catch (ex) {
      console.log('Applications Error', ex.message);
      return null;
    }
  }

  /**
   * Get a list of roles for a given application.
   * @returns An array of application roles or null
   */
  public async Roles(app: string) {
    try {
      return await this.MakeRequest<UWAuthApplicationRoles>(`${this.Config.baseUrl}/roles/${app}.json`);
    } catch (ex) {
      console.log('Roles Error', ex.message);
      return null;
    }
  }

  /**
   * Get authorization information for a person.
   * @param identifier The identifer (UWNetID) of the person to lookup
   * @param app The application to lookup
   * @param role The role to lookup
   * @param mode The mode to use (default: hops)
   * @param limit The limit on the number of authorizers (default: 50)
   * @returns Data representing authorization information for a person or null
   */
  public async Get(identifier: string, app: string, role: string, mode: UWAuthMode = UWAuthMode.Hops, hops: number = 50) {
    try {
      return await this.MakeRequest<UWAuthorizers>(`${this.Config.baseUrl}/auth/${identifier}.json?app=${app}&role=${role}&mode=${mode}&hops=${hops}`, 'GET', {}, WhoCanTimeout);
    } catch (ex) {
      console.log('Get Error', ex.message);
      return null;
    }
  }
}

export default new WhoCanWebService();
