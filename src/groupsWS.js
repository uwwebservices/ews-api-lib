// @ts-check
import rp from 'request-promise';

export default {
  /** @type {Config} */
  Config: {
    certificate: {
      pfx: null,
      passphrase: null,
      ca: null
    },
    baseUrl: ''
  },

  /**
   * Initial setup for GroupsWS library
   * @param {import('./cert').Pfx} certificate
   * @param {string} baseUrl
   */
  Setup(certificate, baseUrl) {
    this.Config.certificate = certificate;
    this.Config.baseUrl = baseUrl;
  },

  /**
   * Searches GroupsWS for groups starting with the provided stemId and depth
   * @param {string} stemId - The stemId to search
   * @param {string} depth - 'one' or 'all', one level deep or all levels deep
   * @param {string} extraQueryParams - Extra query parameters as a string. MUST start with '&'
   * @returns {Promise<string[]>} - An array of groups found matching the stemId
   */
  async Search(stemId, depth = 'one', extraQueryParams = '') {
    const request = this.CreateRequest(`${this.Config.baseUrl}/search?stem=${stemId}&scope=${depth}${extraQueryParams}`, this.Config.certificate);

    let start = new Date();
    let wsGroups = (await rp(request)).data;
    console.log(`Found ${wsGroups.length} subgroups of ${stemId} in ${(+new Date() - +start).toString()}ms`);

    return wsGroups.map(group => group.id);
  },

  /**
   * Update Members of a group (additive)
   * @param {string} group - The group to update membership
   * @param {string[]} members - The members to add to the group
   * @returns {Promise<boolean>} - An array of groups found with additional information.
   */
  async UpdateMembers(group, members) {
    // build the request body with our members to add
    let newMembers = {
      data: members.map(id => {
        return {
          type: 'group',
          id
        };
      })
    };

    const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}/member`, this.Config.certificate, 'PUT', newMembers);
    const start = new Date();
    let response = await rp(request);
    console.log(`Added ${members.length} users/groups to ${group} in ${(+new Date() - +start).toString()}ms`);

    return response.errors[0].status === 200;
  },

  /**
   * Lookup groups in GroupsWS for additional information.
   * @param {string[]} groups - The groups to lookup in GroupsWS.
   * @returns {Promise<UWGroup[]>} - An array of groups found with additional information.
   */
  async Info(groups) {
    const infoGroups = [];
    await Promise.all(
      groups.map(group => {
        const start = new Date();
        const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}`, this.Config.certificate);
        return rp(request)
          .then(resp => {
            console.log(`Got info for a group (${group}) in ${(+new Date() - +start).toString()}ms`);
            const wsGroup = resp.data;
            // the data to extract
            infoGroups.push({
              id: wsGroup.id,
              created: wsGroup.created
            });
          })
          .catch(error => {
            console.log(`Info: Error trying to fetch info for ${group}; ${error}`);
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
        console.log(`Got partial history for a group (${group}) in ${(+new Date() - +timerStart).toString()}ms`);

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
   * Delete groups in GroupsWS.
   * @param {string[]} groups - The groups to delete in GroupsWS.
   * @param {boolean} synchronized - The synchronized flag
   * @returns {Promise<string[]>} - An array of groups deleted in GroupsWS.
   */
  async Delete(groups, synchronized = false) {
    /** @type {string[]} */
    const deletedGroups = [];
    await Promise.all(
      groups.map(group => {
        const start = new Date();
        const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}?synchronized=${synchronized}`, this.Config.certificate, 'DELETE');
        return rp(request)
          .then(resp => {
            console.log(`Deleted a group (${group}) in ${(+new Date() - +start).toString()}ms`);
            if (Array.isArray(resp.errors) && resp.errors.length > 0 && resp.errors[0].status === 200) {
              deletedGroups.push(group);
            }
          })
          .catch(error => {
            console.log(`Delete: Error trying to delete ${group}; ${error}`);
          });
      })
    );

    return deletedGroups;
  },

  /**
   * Default configuration for an API request
   * @param {string} url
   * @param {import('./cert').Pfx} certificate
   * @param {string} method
   * @param {any} body
   * @returns {Request}
   */
  CreateRequest(url, certificate, method = 'GET', body = {}) {
    return {
      method,
      url,
      body,
      json: true,
      time: true,
      ca: [certificate.ca],
      agentOptions: {
        pfx: certificate.pfx,
        passphrase: certificate.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3'
      }
    };
  }
};

/** @typedef {{ id: string, created: number }} UWGroup */
/** @typedef {{ id: string, description: string, timestamp: number }} UWGroupHistory */
/** @typedef {{ certificate: import('./cert').Pfx, baseUrl: string }} Config */
/** @typedef {{ method: string, url: string, body: any, json: boolean, time: boolean, ca: string[], agentOptions: { pfx: string, passphrase: string, securityOptions: string }}} Request */
