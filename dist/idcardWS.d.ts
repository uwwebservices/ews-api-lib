/// <reference types="node" />
import { BaseWebService } from './common';
export interface UWCard {
    Cards: {
        RegID: string;
    }[];
}
export declare enum PhotoSizes {
    Small = "small",
    Medium = "medium",
    Large = "large"
}
declare class IDCardWebService extends BaseWebService {
    /**
     * Get the UWRegID of a person via the magstrip/rfid of their husky card
     * @param magstrip The magstrip of the card to lookup
     * @param rfid The rfid of the card to lookup
     * @returns The UWRegID of the person or an empty string
     */
    GetRegID(magstrip?: string, rfid?: string): Promise<string>;
    /**
     * Get the photo of a person via their UWRegID
     * @param regid The UWRegID of the person for which to fetch a photo
     * @param size The size of the photo to fetch (small, medium, large)
     * @returns The photo or null
     */
    GetPhoto(regid: string, size?: PhotoSizes): Promise<Buffer>;
}
declare const _default: IDCardWebService;
export default _default;
