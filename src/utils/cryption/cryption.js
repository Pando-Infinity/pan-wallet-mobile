import base64 from 'react-native-base64';
import {randomBytes as _randomBytes} from 'crypto';
import {arrayify} from '@ethersproject/bytes';
import {Buffer} from 'buffer';

export const generateEncryptionKey = () => {
  const random = _randomBytes(64);
  return base64.encodeFromByteArray(arrayify(random));
};

export const base64ToArrayBuffer = text => {
  return arrayify(Buffer.from(text, 'base64'));
};
