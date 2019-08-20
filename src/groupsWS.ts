import rp from 'request-promise';
import { BaseWebService } from './common';

interface GWSResponse {
  errors: { status: number }[];
}

interface GWSDataResponse<T> extends GWSResponse {
  data: T;
}

export interface UWGroup {
  id: string;
  created: number;
}

export interface UWGroupMember {
  type: string;
  id: string;
}

export interface UWGroupHistory {
  id: string;
  description: string;
  timestamp: number;
}

const GWSTimeout = 60000;

class GroupsWebService extends BaseWebService {
  /**
   * Searches GroupsWS for groups starting with the provided stemId and depth
   * @param stemId The stemId to search
   * @param depth 'one' or 'all', one level deep or all levels deep (default: 'one')
   * @param extraQueryParams Extra query parameters as a string. MUST start with '&'
   * @returns An array of groups found matching the stemId
   */
  public async Search(stemId: string, depth: string = 'one', extraQueryParams: string = '') {
    try {
      let wsGroups = (await this.MakeRequest<{ data: UWGroup[] }>(`${this.Config.baseUrl}/search?stem=${stemId}&scope=${depth}${extraQueryParams}`, 'GET', {}, GWSTimeout)).data;
      return wsGroups.map(group => group.id);
    } catch (ex) {
      console.log(`GroupSearch: Error trying to search ${stemId}; ${ex.message}`);
      return [];
    }
  }

  /**
   * Replace group members with member list (one memberType at at a time)
   * @param group The group to update membership
   * @param members The new members for the group (replaces old members)
   * @param memberType The type of member you're adding ('group', 'netid', 'dns') (default: 'group')
   * @returns An array of groups found with additional information.
   */
  public async ReplaceMembers(group: string, members: string[], memberType: string = 'group') {
    return this.ReplaceMembersFormatted(group, members.map(id => ({ type: memberType, id })));
  }

  /**
   * Replace group members with a preformatted member list
   * @param group Group to replace members
   * @param formattedMembers Formatted member list (eg. [{ type: 'netid', id: 'foobar93'}])
   */
  public async ReplaceMembersFormatted(group: string, formattedMembers: UWGroupMember[]) {
    try {
      let resp = await this.MakeRequest<GWSResponse>(`${this.Config.baseUrl}/group/${group}/member`, 'PUT', { data: formattedMembers }, GWSTimeout);
      return resp.errors[0].status === 200;
    } catch (ex) {
      console.log(`ReplaceMembers: Error trying to add members to ${group}; ${ex.message}`);
      return false;
    }
  }

  /**
   * Add multiple members to a group
   * @param group The group to add members to
   * @param members The members to be added
   * @returns A flag representing if members were successfully added
   */
  public async AddMembers(group: string, members: string[]) {
    return await this.AddMember(group, members.join(','));
  }

  /**
   * Add one member to a group
   * @param group The group to add a member to
   * @param member The member to add to the specified group
   * @returns A flag representing if the action was completed successfully
   */
  public async AddMember(group: string, member: string) {
    try {
      const resp = await this.MakeRequest<GWSResponse>(`${this.Config.baseUrl}/group/${group}/member/${member}`, 'PUT', {}, GWSTimeout);
      return resp.errors[0].status === 200;
    } catch (ex) {
      console.log(`AddMember: Error trying to add ${member} to ${group}; ${ex.message}`);
      return false;
    }
  }

  /**
   * Lookup groups in GroupsWS for additional information.
   * @param groups The groups to lookup
   * @param whitelist The group properties to return (default: [] - return all info)
   * @returns An array of groups found with additional information
   */
  public async Info(groups: string[], whitelist = []) {
    const infoGroups: UWGroup[] = [];
    await Promise.all(
      groups.map(group => {
        return this.MakeRequest<GWSDataResponse<UWGroup>>(`${this.Config.baseUrl}/group/${group}`, 'GET', {}, GWSTimeout)
          .then(resp => {
            const wsGroup = resp.data;
            if (whitelist.length === 0) {
              infoGroups.push(wsGroup);
            } else {
              let cleaned = {
                id: wsGroup.id,
                created: wsGroup.created
              };
              for (let w of whitelist) {
                cleaned[w] = wsGroup[w];
              }
              infoGroups.push(cleaned);
            }
          })
          .catch(ex => {
            console.log(`Info: Error trying to fetch info for ${group}; ${ex.message}`);
            return [];
          });
      })
    );

    return infoGroups;
  }

  /**
   * Get history data for a specific group
   * @param group The group for which to get history
   * @returns The group history
   */
  public async GetHistory(group: string) {
    let history: UWGroupHistory[] = [];
    let start = 0;
    let fetchHistory = true;

    while (fetchHistory) {
      try {
        let res = await this.MakeRequest<GWSDataResponse<UWGroupHistory[]>>(`${this.Config.baseUrl}/group/${group}/history?activity=membership&order=a&start=${start}`, 'GET', {}, GWSTimeout);

        // Breakout if no data available
        if (!res || !res.data || res.data.length == 0) {
          fetchHistory = false;
          break;
        }

        history = history.concat(res.data);
        start = (res.data as UWGroupHistory[]).reduce((prev, current) => {
          return prev > current.timestamp ? prev : current.timestamp + 1;
        }, start);
      } catch (ex) {
        console.log(ex.message);
        return null;
      }
    }

    return history;
  }

  /**
   * Delete groups in GroupsWS
   * @param groups The groups to delete in GroupsWS
   * @param synchronized Wait until the group has been fully deleted before returning? (default: false)
   * @returns An array of groups deleted in GroupsWS
   */
  public async Delete(groups: string[], synchronized: boolean = false) {
    const deletedGroups: string[] = [];
    await Promise.all(
      groups.map(async group => {
        try {
          const resp = await this.MakeRequest<GWSResponse>(`${this.Config.baseUrl}/group/${group}?synchronized=${synchronized}`, 'DELETE', {}, GWSTimeout);
          if (Array.isArray(resp.errors) && resp.errors.length > 0 && resp.errors[0].status === 200) {
            deletedGroups.push(group);
          }
        } catch (ex) {
          console.log(`Delete: Error trying to delete ${group}; ${ex.message}`);
          return [];
        }
      })
    );

    return deletedGroups;
  }

  /**
   * Create a new group
   * @param group The group id to create
   * @param admins A list of admins (netid, dns, group) that can administer this group
   * @param readers A list of viewers (netid, dns, group) of this group (default: [])
   * @param classification Should this group be public or private ('u' - public, 'c' - private) (default: 'u')
   * @param displayName The display name for the new group (default: '')
   * @param description A description of the new group (default: '')
   * @param synchronized Wait until the group has been fully deleted before returning? (default: true)
   * @param email Enable email for this group? (default: false)
   * @returns Group was sucessfully created flag
   */
  public async Create(
    group: string,
    admins: UWGroupMember[],
    readers: UWGroupMember[] = [],
    classification: string = 'u',
    displayName: string = '',
    description: string = '',
    synchronized: boolean = true,
    email: boolean = false
  ): Promise<UWGroup | null> {
    if (!group || !admins) {
      return null;
    }
    const body = {
      data: {
        id: group,
        displayName,
        description,
        admins,
        readers,
        classification
      }
    };

    try {
      let res = await this.MakeRequest<GWSDataResponse<UWGroup>>(`${this.Config.baseUrl}/group/${group}?synchronized=${synchronized}`, 'PUT', body, GWSTimeout);
      if (email) {
        await this.MakeRequest(`${this.Config.baseUrl}/group/${group}/affiliate/google?status=active&sender=member`, 'PUT', GWSTimeout);
      }
      return res.data;
    } catch (ex) {
      console.log(`Create: Error trying to create ${group}; ${ex.message}`);
      return null;
    }
  }

  /**
   * Remove multiple members from a group
   * @param group The group to remove members from
   * @param members The members to be removed
   * @param synchronized Wait until the group has been fully deleted before returning? (default: true)
   * @returns Members were successfully removed flag
   */
  public async RemoveMembers(group: string, members: string[], synchronized: boolean = true) {
    return await this.RemoveMember(group, members.join(','), synchronized);
  }

  /**
   * Remove a member from a group
   * @param group The group to remove a member from
   * @param member The member to be removed
   * @param synchronized Wait until the group has been fully deleted before returning? (default: true)
   * @returns Member was successfully removed flag
   */
  public async RemoveMember(group: string, member: string, synchronized: boolean = true) {
    try {
      const resp = await this.MakeRequest<GWSResponse>(`${this.Config.baseUrl}/group/${group}/member/${member}?synchronized=${synchronized.toString()}`, 'DELETE', {}, GWSTimeout);
      return resp.errors[0].status === 200;
    } catch (ex) {
      console.log(`RemoveMembers: Error trying to remove ${member} from ${group}; ${ex.message}`);
      return false;
    }
  }

  /**
   * Get group direct or effective members
   * @param group The group to get membership from
   * @param effective Include members of groups?
   * @param force Force GWS to not use it's cached value (default: false)
   * @returns A list of group members (default: false)
   */
  public async GetMembers(group: string, effective: boolean = false, force: boolean = false) {
    const endpoint = effective ? 'effective_member' : 'member';
    try {
      const res = await this.MakeRequest<GWSDataResponse<UWGroupMember[]>>(`${this.Config.baseUrl}/group/${group}/${endpoint}${force ? '?source=registry' : ''}`, 'GET', {}, GWSTimeout);
      return res.data;
    } catch (ex) {
      console.log(`Get Members: Error getting members for group ${group}; ${ex.message}`);
      return [];
    }
  }
}

export default new GroupsWebService();
