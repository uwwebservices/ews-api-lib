// @ts-check
import rp from 'request-promise';

export default {
  /** @type {Config} */
  Config: {
    certificate: {
      pfx: null,
      passphrase: null,
      ca: null,
      incommon: null
    },
    baseUrl: ''
  },

  /**
   * Initial setup for GroupsWS library
   * @param {import('./cert').Pfx} certificate - The certificate object to use for future GWS calls
   * @param {string} baseUrl - The baseUrl for future GWS calls
   */
  Setup(certificate, baseUrl) {
    this.Config.certificate = certificate;
    this.Config.baseUrl = baseUrl;
  },

  /**
   * Searches GroupsWS for groups starting with the provided stemId and depth
   * @param {string} stemId - The stemId to search
   * @param {string} depth - 'one' or 'all', one level deep or all levels deep (default: 'one')
   * @param {string} extraQueryParams - Extra query parameters as a string. MUST start with '&'
   * @returns {Promise<string[]>} - An array of groups found matching the stemId
   */
  async Search(stemId, depth = 'one', extraQueryParams = '') {
    const request = this.CreateRequest(`${this.Config.baseUrl}/search?stem=${stemId}&scope=${depth}${extraQueryParams}`, this.Config.certificate);

    let start = new Date();
    try {
      let wsGroups = (await rp(request)).data;
      return wsGroups.map(group => group.id);
    } catch (error) {
      console.log(`GroupSearch: Error trying to search ${stemId}; ${error}`);
      return [];
    }
  },

  /**
   * Replace group members with member list
   * @param {string} group - The group to update membership
   * @param {string[]} members - The new members for the group (replaces old members)
   * @param {string} memberType - The type of member you're adding ('group', 'netid', 'dns') (default: 'group')
   * @returns {Promise<boolean>} - An array of groups found with additional information.
   */
  async ReplaceMembers(group, members, memberType = 'group') {
    return this.ReplaceMembersFormatted(group, members.map(id => ({ type: memberType, id })));
  },
  /**
   *
   * @param {string} group
   * @param {UWGroupMember[]} members
   */
  async ReplaceMembersFormatted(group, formattedMembers) {
    const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}/member`, this.Config.certificate, 'PUT', { data: formattedMembers });
    try {
      let resp = await rp(request);
      return resp.errors[0].status === 200;
    } catch (error) {
      console.log(`ReplaceMembers: Error trying to add members to ${group}; ${error}`);
      return false;
    }
  },
  /**
   * Add multiple members to a group
   * @param {string} group - The group to add members to
   * @param {string[]} members - The members to be added
   * @returns {Promise<boolean>} - A flag representing if members were successfully added
   */
  async AddMembers(group, members) {
    return await this.AddMember(group, members.join(','));
  },

  /**
   * Add one member to a group
   * @param {string} group - The group to add a member to
   * @param {string} member - The member to add to the specified group
   * @returns {Promise<boolean>} - A flag representing if the action was completed successfully
   */
  async AddMember(group, member) {
    const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}/member/${member}`, this.Config.certificate, 'PUT');
    try {
      const resp = await rp(request);
      return resp.errors[0].status === 200;
    } catch (error) {
      console.log(`AddMember: Error trying to add ${member} to ${group}; ${error}`);
      return false;
    }
  },

  /**
   * Lookup groups in GroupsWS for additional information.
   * @param {string[]} groups - The groups to lookup
   * @returns {Promise<UWGroup[]>} - An array of groups found with additional information
   */
  async Info(groups) {
    const infoGroups = [];
    await Promise.all(
      groups.map(group => {
        const start = new Date();
        const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}`, this.Config.certificate);
        return rp(request)
          .then(resp => {
            //console.log(`Got info for a group (${group}) in ${(+new Date() - +start).toString()}ms`);
            const wsGroup = resp.data;
            // the data to extract
            infoGroups.push({
              id: wsGroup.id,
              created: wsGroup.created
            });
          })
          .catch(error => {
            console.log(`Info: Error trying to fetch info for ${group}; ${error}`);
            return [];
          });
      })
    );

    return infoGroups;
  },

  /**
   * Get history data for a specific group
   * @param {string} group - The group for which to get history
   * @returns {Promise<UWGroupHistory[]>} - The group history
   */
  async GetHistory(group) {
    let history = [];
    let start = 0;
    let fetchHistory = true;

    while (fetchHistory) {
      const timerStart = new Date();
      const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}/history?activity=membership&order=a&start=${start}`, this.Config.certificate);
      try {
        let res = await rp(request);

        // Breakout if no data available
        if (!res || !res.data || res.data.length == 0) {
          fetchHistory = false;
          break;
        }

        history = history.concat(res.data);
        start = res.data.reduce((prev, current) => {
          return prev > current.timestamp ? prev : current.timestamp + 1;
        }, start);
      } catch (ex) {
        return null;
      }
    }

    return history;
  },

  /**
   * Delete groups in GroupsWS
   * @param {string[]} groups - The groups to delete in GroupsWS
   * @param {boolean} synchronized - Wait until the group has been fully deleted before returning? (default: false)
   * @returns {Promise<string[]>} - An array of groups deleted in GroupsWS
   */
  async Delete(groups, synchronized = false) {
    /** @type {string[]} */
    const deletedGroups = [];
    await Promise.all(
      groups.map(async group => {
        const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}?synchronized=${synchronized}`, this.Config.certificate, 'DELETE');
        try {
          const resp = await rp(request);
          if (Array.isArray(resp.errors) && resp.errors.length > 0 && resp.errors[0].status === 200) {
            deletedGroups.push(group);
          }
        } catch (error) {
          console.log(`Delete: Error trying to delete ${group}; ${error}`);
          return [];
        }
      })
    );

    return deletedGroups;
  },

  /**
   * Create a new group
   * @param {string} group - The group id to create
   * @param {string[]} admins - A list of admins (netid, dns, group) that can administer this group
   * @param {string[]} readers - A list of viewers (netid, dns, group) of this group (default: [])
   * @param {string} classification - Should this group be public or private ('u' - public, 'c' - private) (default: 'u')
   * @param {string} displayName - The display name for the new group (default: '')
   * @param {string} description - A description of the new group (default: '')
   * @param {boolean} synchronized - Wait until the group has been fully deleted before returning? (default: true)
   * @param {boolean} email - Enable email for this group? (default: false)
   * @returns {Promise<boolean>} - Group was sucessfully created flag
   */
  async Create(group, admins, readers = [], classification = 'u', displayName = '', description = '', synchronized = true, email = false) {
    if (!group || !admins) {
      return false;
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
    const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}?synchronized=${synchronized}`, this.Config.certificate, 'PUT', body);

    try {
      let res = await rp(request);
      if (email) {
        await rp(this.CreateRequest(`${this.Config.baseUrl}/group/${group}/affiliate/google?status=active&sender=member`, this.Config.certificate, 'PUT'));
      }
      return res.data;
    } catch (error) {
      console.log(`Create: Error trying to create ${group}; ${error}`);
      return false;
    }
  },

  /**
   * Remove multiple members from a group
   * @param {string} group - The group to remove members from
   * @param {string[]} members - The members to be removed
   * @param {boolean} synchronized - Wait until the group has been fully deleted before returning? (default: true)
   * @returns {Promise<boolean>} - Members were successfully removed flag
   */
  async RemoveMembers(group, members, synchronized = true) {
    return await this.RemoveMember(group, members.join(','), synchronized);
  },
  /**
   * Remove a member from a group
   * @param {string} group - The group to remove a member from
   * @param {string} member - The member to be removed
   * @param {boolean} synchronized - Wait until the group has been fully deleted before returning? (default: true)
   * @returns {Promise<boolean>} - Member was successfully removed flag
   */
  async RemoveMember(group, member, synchronized = true) {
    const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}/member/${member}?synchronized=${synchronized.toString()}`, this.Config.certificate, 'DELETE');
    try {
      const resp = await rp(request);
      return resp.errors[0].status === 200;
    } catch (error) {
      console.log(`RemoveMembers: Error trying to remove ${member} from ${group}; ${error}`);
      return false;
    }
  },

  /**
   * Get group direct or effective members
   * @param {string} group - The group to get membership from
   * @param {boolean} effective - Include members of groups?
   * @param {boolean} force - Force GWS to not use it's cached value (default: false)
   * @returns {Promise<UWGroupMember[]>} - A list of group members (default: false)
   */
  async GetMembers(group, effective = false, force = false) {
    const endpoint = effective ? 'effective_member' : 'member';
    const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}/${endpoint}${force ? '?source=registry' : ''}`, this.Config.certificate);
    try {
      const res = await rp(request);
      return res.data;
    } catch (error) {
      console.log(`Get Members: Error getting members for group ${group}; ${error}`);
      return [];
    }
  },

  /**
   * Default configuration for an API request
   * @param {string} url - The full URL to make ar equest to
   * @param {import('./cert').Pfx} certificate - Certificate informationg for the request
   * @param {string} method - HTTP Method to use (default: 'GET')
   * @param {any} body - A body object to send with the request (default: {})
   * @returns {Request} - A request/request-promise configuration object
   */
  CreateRequest(url, certificate, method = 'GET', body = {}) {
    let options = {
      method,
      url,
      body,
      json: true,
      time: true,
      ca: [],
      timeout: 60000,
      agentOptions: {
        pfx: certificate.pfx,
        passphrase: certificate.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3'
      }
    };
    if (certificate.ca) {
      options.ca.push(certificate.ca);
    }
    if (certificate.incommon) {
      options.ca.push(certificate.incommon);
    }
    return options;
  }
};

/** @typedef {{ id: string, created: number }} UWGroup */
/** @typedef {{ type: string, id: string }} UWGroupMember */
/** @typedef {{ id: string, description: string, timestamp: number }} UWGroupHistory */
/** @typedef {{ certificate: import('./cert').Pfx, baseUrl: string }} Config */
/** @typedef {{ method: string, url: string, body: any, json: boolean, time: boolean, ca: string[], agentOptions: { pfx: string, passphrase: string, securityOptions: string }}} Request */
