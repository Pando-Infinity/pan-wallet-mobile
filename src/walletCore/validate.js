
import { validate } from 'bitcoin-address-validation'
import Web3 from 'web3';
import { PublicKey } from '@solana/web3.js';

export const isBtcAddress = (s) => {
    return validate(s);
}

export const isEthAddress = (address) => {
    const web3 = new Web3();
    return web3.utils.isAddress(address);
}

export const isSolAddress = (address) => {
    try {
        let pubkey = new PublicKey(address);
        let isSolana = PublicKey.isOnCurve(pubkey.toBuffer());
        return isSolana;
    } catch (error) {
        return false;
    }

}