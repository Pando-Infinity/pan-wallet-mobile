import {TABLE_NAME} from '../constants';

export const AddressSCHEMA = {
  name: TABLE_NAME.address_schema,
  primaryKey: '_id',
  properties: {
    _id: 'int',
    idAccountWallet: 'int',
    addressList: 'string[]',
  },
};
