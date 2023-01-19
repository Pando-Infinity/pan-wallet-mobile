import {TABLE_NAME} from '../constants';

export const StackScreenSCHEMA = {
  name: TABLE_NAME.stack_screen_schema,
  primaryKey: '_id',
  properties: {
    _id: 'int',
    stack: 'string',
  },
};
