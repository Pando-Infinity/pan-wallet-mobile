import {IMAGES, COLOR, NETWORK_NAME} from '../constants';
//language:
import {STRINGS} from '../constants';
import stringFormat from '../components/StringFormat/StringFormat';
import Constants from '../constants/constants';

export const slidesFunction = translate => [
  {
    id: '1',
    image: IMAGES.onBroading1,
    title: translate(STRINGS.OnBoard1Title),
    subtitle: translate(STRINGS.OnBoard1SupTitle),
  },
  {
    id: '2',
    image: IMAGES.onBroading2,
    title: translate(STRINGS.OnBoard2Title),
    subtitle: translate(STRINGS.OnBoard2SupTitle),
  },
  {
    id: '3',
    image: IMAGES.onBroading3,
    title: translate(STRINGS.OnBoard3Title),
    subtitle: translate(STRINGS.OnBoard3SupTitle),
  },
];
export const RegexDataFunction = translate => ({
  text: translate(STRINGS.passwordStrength),
  strong: {
    supText: translate(STRINGS.strong),
    color: 'green',
  },
  medium: {
    supText: translate(STRINGS.medium),
    color: 'yellow',
  },
  weak: {
    supText: translate(STRINGS.weak),
    color: 'red',
  },
  invalid: {
    text: translate(STRINGS.must8Character),
    supText: '',
    color: 'white',
  },
});
export const optionalConfigObjectFunction = translate => ({
  title: translate(STRINGS.authenticateTitle), // Android
  imageColor: COLOR.imageColorSuccess, // Android
  imageErrorColor: COLOR.imageErrorColor, // Android
  sensorDescription: translate(STRINGS.sensorDescription), // Android
  sensorErrorDescription: translate(STRINGS.sensorErrorDescription), // Android
  cancelText: translate(STRINGS.cancelText), // Android
  fallbackLabel: translate(STRINGS.fallbackLabel), // iOS (if empty, then label is hidden)
  unifiedErrors: false, // use unified error messages (default false)
  passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
});
const convertTimeLock = (seconds, translate) => {
  if (seconds > 60) {
    return stringFormat(translate(STRINGS.after_minutes), [`${seconds / 60}`]);
  } else {
    return stringFormat(translate(STRINGS.after_seconds), [`${seconds}`]);
  }
};
export const autoLockTimeFunction = translate => [
  {
    id: '0',
    content: translate(STRINGS.immediate),
  },
  {
    id: '1',
    content: convertTimeLock(Constants.autoLockLv1, translate),
  },
  {
    id: '2',
    content: convertTimeLock(Constants.autoLockLv2, translate),
  },
  {
    id: '3',
    content: convertTimeLock(Constants.autoLockLv3, translate),
  },
  {
    id: '4',
    content: convertTimeLock(Constants.autoLockLv4, translate),
  },
  {
    id: '5',
    content: convertTimeLock(Constants.autoLockLv5, translate),
  },
  {
    id: '6',
    content: convertTimeLock(Constants.autoLockLv6, translate),
  },
];
