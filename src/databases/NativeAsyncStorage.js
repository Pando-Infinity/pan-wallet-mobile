import { NativeModules, Platform } from 'react-native';
import { DATA_TYPE } from '../constants';

const storageIOS = NativeModules.NativeAsyncStorage;

/// save value by key ios
const saveDataInIOS = (key, val) => {
  switch (typeof val) {
    case 'number':
    case 'boolean':
      storageIOS.saveNumber(val, key);
      break;
    case 'object':
      storageIOS.saveObject(val, key);
      break;
    case 'string':
      storageIOS.save(val, key);
      break;
    default:
      break;
  }
};

const getDataInIOS = Platform.OS === 'ios' ? storageIOS.getObject : () => {};

//save value by key android

const { SharePreferencesModule } = NativeModules;

const saveDataInAndroid = (key, value) => {
  switch (typeof value) {
    case DATA_TYPE.number: {
      SharePreferencesModule.saveFloat(key, value);
      break;
    }

    case DATA_TYPE.boolean: {
      SharePreferencesModule.saveBoolean(key, value);
      break;
    }

    case DATA_TYPE.object: {
      const val = JSON.stringify(value);
      SharePreferencesModule.saveString(key, val);
      break;
    }

    case DATA_TYPE.string: {
      SharePreferencesModule.saveString(key, value);
      break;
    }

    default:
      break;
  }
};

const getDataInAndroid = (key, dataType, callBack) => {
  switch (dataType) {
    case DATA_TYPE.number: {
      SharePreferencesModule.getFloat(key, value => {
        callBack(value);
      });
      break;
    }

    case DATA_TYPE.boolean: {
      SharePreferencesModule.getBoolean(key, value => {
        callBack(value);
      });
      break;
    }

    case DATA_TYPE.object: {
      SharePreferencesModule.getStringSP(key, value => {
        callBack(JSON.parse(value));
      });
      break;
    }

    case DATA_TYPE.string: {
      SharePreferencesModule.getStringSP(key, value => {
        callBack(value);
      });
      break;
    }

    default:
      break;
  }
};

const saveData = (key, value) => {
  Platform.OS === 'ios'
    ? saveDataInIOS(key, value)
    : saveDataInAndroid(key, value);
};

const getData = (key, dataType, callback) => {
  if (Platform.OS === 'ios') {
    getDataInIOS(key, callback);
  } else {
    getDataInAndroid(key, dataType, callback);
  }
};

export default {
  saveData,
  getData,
};
