import { Pfx } from './cert';
export interface WebServiceConfig {
    certificate: Pfx;
    baseUrl: string;
}
interface Request {
    method: string;
    url: string;
    body: any;
    json: boolean;
    time: boolean;
    ca: string[];
    agentOptions: {
        pfx: string;
        passphrase: string;
        securityOptions: string;
    };
}
/**
 * Default configuration for an API request
 * @param url The full URL to make ar equest to
 * @param certificate Certificate informationg for the request
 * @param method HTTP Method to use (default: 'GET')
 * @param body A body object to send with the request (default: {})
 * @returns A request/request-promise configuration object
 */
export declare const CreateRequest: (url: string, certificate: Pfx, method?: string, body?: any, timeout?: number) => Request;
export {};
