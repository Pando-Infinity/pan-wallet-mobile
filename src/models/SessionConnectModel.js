import { TABLE_NAME } from '../constants';

export const SessionConnect = {
  name: TABLE_NAME.session_connect,
  primaryKey: '_id',
  properties: {
    _id: 'string',
    schema: 'string',
    bundle: 'string',
    dapp_name: 'string',
    logo: 'string',
    url: 'string',
    address: '{}',
    walletID: 'int',
    networkName: 'string',
    connectedTime: 'date',
  },
};
