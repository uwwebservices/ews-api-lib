import { WebServiceConfig } from './common';
import { Pfx } from './cert';
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
declare const _default: {
    Config: WebServiceConfig;
    /**
     * Initial setup for GroupsWS library
     */
    Setup(certificate: Pfx, baseUrl: string): void;
    /**
     * Searches GroupsWS for groups starting with the provided stemId and depth
     * @param stemId The stemId to search
     * @param depth 'one' or 'all', one level deep or all levels deep (default: 'one')
     * @param extraQueryParams Extra query parameters as a string. MUST start with '&'
     * @returns An array of groups found matching the stemId
     */
    Search(stemId: string, depth?: string, extraQueryParams?: string): Promise<string[]>;
    /**
     * Replace group members with member list (one memberType at at a time)
     * @param group The group to update membership
     * @param members The new members for the group (replaces old members)
     * @param memberType The type of member you're adding ('group', 'netid', 'dns') (default: 'group')
     * @returns An array of groups found with additional information.
     */
    ReplaceMembers(group: string, members: string[], memberType?: string): Promise<any>;
    /**
     * Replace group members with a preformatted member list
     * @param group Group to replace members
     * @param formattedMembers Formatted member list (eg. [{ type: 'netid', id: 'foobar93'}])
     */
    ReplaceMembersFormatted(group: string, formattedMembers: UWGroupMember[]): Promise<boolean>;
    /**
     * Add multiple members to a group
     * @param group The group to add members to
     * @param members The members to be added
     * @returns A flag representing if members were successfully added
     */
    AddMembers(group: string, members: string[]): Promise<any>;
    /**
     * Add one member to a group
     * @param group The group to add a member to
     * @param member The member to add to the specified group
     * @returns A flag representing if the action was completed successfully
     */
    AddMember(group: string, member: string): Promise<boolean>;
    /**
     * Lookup groups in GroupsWS for additional information.
     * @param groups The groups to lookup
     * @returns An array of groups found with additional information
     */
    Info(groups: string[]): Promise<UWGroup[]>;
    /**
     * Get history data for a specific group
     * @param group The group for which to get history
     * @returns The group history
     */
    GetHistory(group: string): Promise<UWGroupHistory[]>;
    /**
     * Delete groups in GroupsWS
     * @param groups The groups to delete in GroupsWS
     * @param synchronized Wait until the group has been fully deleted before returning? (default: false)
     * @returns An array of groups deleted in GroupsWS
     */
    Delete(groups: string[], synchronized?: boolean): Promise<string[]>;
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
    Create(group: string, admins: UWGroupMember[], readers?: UWGroupMember[], classification?: string, displayName?: string, description?: string, synchronized?: boolean, email?: boolean): Promise<UWGroup>;
    /**
     * Remove multiple members from a group
     * @param group The group to remove members from
     * @param members The members to be removed
     * @param synchronized Wait until the group has been fully deleted before returning? (default: true)
     * @returns Members were successfully removed flag
     */
    RemoveMembers(group: string, members: string[], synchronized?: boolean): Promise<any>;
    /**
     * Remove a member from a group
     * @param group The group to remove a member from
     * @param member The member to be removed
     * @param synchronized Wait until the group has been fully deleted before returning? (default: true)
     * @returns Member was successfully removed flag
     */
    RemoveMember(group: string, member: string, synchronized?: boolean): Promise<boolean>;
    /**
     * Get group direct or effective members
     * @param group The group to get membership from
     * @param effective Include members of groups?
     * @param force Force GWS to not use it's cached value (default: false)
     * @returns A list of group members (default: false)
     */
    GetMembers(group: string, effective?: boolean, force?: boolean): Promise<UWGroupMember[]>;
};
export default _default;
