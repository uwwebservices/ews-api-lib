import { BaseWebService } from './common';
declare class HRPWebService extends BaseWebService {
    /**
     * Get information for a person via HRPWS.
     * @param identifier - The identifer (UWNetID or UWRegID) of the person to lookup
     * @returns Data representing a person or null
     */
    Get(identifier: string): Promise<any>;
}
declare const _default: HRPWebService;
export default _default;
