import { Pfx } from './cert';
interface WebServiceConfig {
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
export declare class BaseWebService {
    protected Config: WebServiceConfig;
    constructor();
    /**
     * Initial setup for the web service
     * @param certificate
     * @param baseUrl
     */
    Setup(certificate: Pfx, baseUrl: string): void;
    /**
     * Reset the setup for the web service
     */
    Reset(): void;
    /**
     * Default configuration for an API request
     * @param url The full URL to make ar equest to
     * @param certificate Certificate informationg for the request
     * @param method HTTP Method to use (default: 'GET')
     * @param body A body object to send with the request (default: {})
     * @returns A request/request-promise configuration object
     */
    protected CreateRequest(url: string, certificate: Pfx, method?: string, body?: any, timeout?: number): Request;
}
export {};
