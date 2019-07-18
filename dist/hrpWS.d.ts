import { WebServiceConfig } from './common';
import { Pfx } from './cert';
declare const _default: {
    Config: WebServiceConfig;
    /**
     * Initial setup for HRPWS library
     * @param certificate
     * @param baseUrl
     */
    Setup(certificate: Pfx, baseUrl: string): void;
    /**
     * Get information for a person via HRPWS.
     * @param identifier - The identifer (UWNetID or UWRegID) of the person to lookup
     * @returns Data representing a person or null
     */
    Get(identifier: string): Promise<any>;
};
export default _default;
