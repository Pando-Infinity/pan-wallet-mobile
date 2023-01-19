import * as Keychain from 'react-native-keychain';
import {
  base64ToArrayBuffer,
  generateEncryptionKey,
} from 'utils/cryption/cryption';

import { DAORepository, NativeAsyncStorage } from './index';
import { DATA_TYPE, NATIVE_ASYNC_STORAGE } from '../constants';

const savePassword = password => {
  Keychain.getGenericPassword().then(credentials => {
    if (credentials) {
      const keyChain = JSON.parse(credentials.password);
      keyChain.password = password;
      Keychain.setGenericPassword('keyChain', JSON.stringify(keyChain)).done();
    }
  });
};

const saveDataToKeyChain = () => {
  Keychain.getGenericPassword().then(credentials => {
    if (!credentials) {
      saveEncryptionToKeychain();
    } else {
      NativeAsyncStorage.getData(
        NATIVE_ASYNC_STORAGE.installedApp,
        DATA_TYPE.string,
        data => {
          if (data !== 'true') {
            saveEncryptionToKeychain();
          }
        },
      );
    }
  });
};

const saveEncryptionToKeychain = () => {
  const key = generateEncryptionKey();
  const keyChain = {
    password: '',
    encryptionKey: key,
  };
  Keychain.setGenericPassword('keyChain', JSON.stringify(keyChain)).then(() => {
    DAORepository.deleteAllObject();
  });
  NativeAsyncStorage.saveData(NATIVE_ASYNC_STORAGE.installedApp, 'true');
};

const getPassword = async () => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      return JSON.parse(credentials.password).password;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

const getEncryptionKey = async () => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      return base64ToArrayBuffer(
        JSON.parse(credentials.password).encryptionKey,
      );
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export default {
  savePassword,
  saveDataToKeyChain,
  getPassword,
  getEncryptionKey,
};
