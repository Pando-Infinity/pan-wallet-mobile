import { Dimensions, Platform, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const widthScreen = Dimensions.get('screen').width;
const heightScreen = Dimensions.get('screen').height;
const statusBarHeight = StatusBar.currentHeight;
const navigationBarAndroidHeight = heightScreen - height;

export const COLOR = {
  //natural
  surface: '#4B4B4B',
  surface3_alpha20: '#58526233',
  gray2: '#1C1522',
  gray3: '#28212F',
  gray4: '#3A3143',
  gray5: '#554961',
  gray6: '#756B7E',
  gray7: '#9C91A4',
  gray8: '#BAAEBE',
  gray9: '#E7DCEA',
  gray10: '#F2ECF4',
  white: '#FFFFFF',
  //action
  actionDefault: '#756B7E',
  actionPressed: '#3A3143',
  actionDisabled: '#28212F',
  //Primary
  shade10: '#3B1E6C',
  shade9: '#4B2689',
  shade8: '#5E2FAA',
  shade7: '#7038CC',
  shade6: '#8442F0',
  shade5: '#9A64F3',
  shade4: '#B288F6',
  shade3: '#CAAEF9',
  shade2: '#E1D2FB',
  shade1: '#F3ECFE',
  actionMain1: '#8442F0',
  actionDark1: '#5E2FAA',
  actionLight1: '#9A64F3',
  actionLink1: '#CAAEF9',
  actionContrast: '#CAAEF9',
  statesPressed: '#22143A',
  stateDefault: '#3A1F67',
  //text
  textPrimary: '#FFFFFF',
  textSecondary: '#C1B4C5',
  textDisable: '#9C91A4',
  textPlaceholder: '#BAAEBE',
  termsColor: '#CAAEF9',
  textWarning: '#DAB46B',
  // System
  systemRedLight: '#F595A7',
  systemYellowLight1: '#DAC86B',
  // layout color
  layoutColors: ['#a67cb966', '#7e1fc966', '#00000000'],
  layoutBgColor: '#09080c',
  //button
  buttonColors: ['#9D3CEA', '#9D3CEA', '#7E31D3', '#4F1CA4'],
  gradient3: ['#FF85EB', '#6456FF', '#AC26FF'],
  btnImportColor: '#3A1F67',
  //page control indicator
  pageControlIndicatorColor: '#8442F0',
  simpleBackground: '#221D2F',

  //switch and check box
  trackColorEnable: '#8442F0',
  trackColorDisable: '#756B7E',
  //touchID/FaceID
  imageColorSuccess: '#e00606',
  imageErrorColor: '#ff0000',

  //text input color border gradient
  textInputBorderGradient: ['#FF85EB', '#6456FF', '#AC26FF'],

  buttonViewSeedPhraseColor: ['#B928FE', '#0E2145'],

  black: '#000',

  backgroundStatusBar: '#00000000',

  textTermsCondition: '#C1B4C5',

  circleGradientColor: {
    first: '#AC26FF',
    second: '#6456FF',
    third: '#FF85EB',
    stroke: '#28212F',
  },

  borderGradientOneColor: ['#554961', '#554961', '#554961'],

  buttonImportWalletDisableColor: '#100918',

  blackOpacity04: 'rgba(0,0,0,0.6)',
  blackOpacity05: 'rgba(0,0,0,0.5)',
  blackOpacity07: 'rgba(0, 0, 0, 0.7)',

  primaryActionLink1: '#CAAEF9',

  neutralSurface2: 'rgba(225, 210, 251, 0.1)',

  systemGreenLight1: '#7EDEB0',
  systemGreenLight2: 'rgba(126, 222, 176, 0.25)',
  systemRedLight2: 'rgba(245, 149, 167, 0.25)',
  systemGrayLight: 'rgba(149, 165, 166,1.0)',
  systemGrayLight2: 'rgba(149, 165, 166,0.25)',
  systemYellowLight: 'rgba(219,199,108, 1.0)',
  systemYellowLight2: 'rgba(219,199,108, 0.25)',
  systemYellow: '#2E251E',
  avatarDapp: '#7B61FF',

  neutral_grey_3: '#28212F',

  system_red_background: '#2E1E1E',
  system_yellow_background: 'rgba(218, 200, 107, 0.25)',
  system_green_background: '#1E2E22',
};

export const SIZES = {
  //screen size
  width: width,
  height: height,

  widthScreen: widthScreen,
  heightScreen: heightScreen,

  statusBarHeight: statusBarHeight,

  navigationBarAndroidHeight:
    Platform.OS === 'android' ? navigationBarAndroidHeight : 0,

  bold: '700',
  regular: '400',

  // icon
  iconWidth: 40,
  iconHeight: 40,
  detailIconSize: 56,

  //button
  buttonHeight: 48,
  spaceButton: 12,

  // simple view
  simpleMargin: 16,
  simpleSpace: 8,
  simpleHeightTextField: 56,
  radius: 6,
  homeViewRadius: 24,
  topSpaceTextInput: 28,
  spaceWidthBackButton: 26,
  spaceWidthHeader: 12,
  paddingVerticalTextInput: 3,
  sizeAvatarDapp: 64,

  // button
  iconSize: 24,

  //button back:
  marginStatusbar: 52,
};

export const FONTS = {
  t48b: { fontSize: 48, lineHeight: 56, fontWeight: SIZES.bold },
  t48r: { fontSize: 48, lineHeight: 56, fontWeight: SIZES.regular },
  t30b: { fontSize: 30, lineHeight: 38, fontWeight: SIZES.bold },
  t30r: { fontSize: 30, lineHeight: 38, fontWeight: SIZES.regular },
  t24b: { fontSize: 24, lineHeight: 32, fontWeight: SIZES.bold },
  t24r: { fontSize: 24, lineHeight: 32, fontWeight: SIZES.regular },
  t20b: { fontSize: 20, lineHeight: 28, fontWeight: SIZES.bold },
  t20r: { fontSize: 20, lineHeight: 28, fontWeight: SIZES.regular },
  t18b: { fontSize: 18, lineHeight: 28, fontWeight: SIZES.bold },
  t18r: { fontSize: 18, lineHeight: 28, fontWeight: SIZES.regular },
  t16b: { fontSize: 16, lineHeight: 20, fontWeight: SIZES.bold },
  t16r: { fontSize: 16, lineHeight: 20, fontWeight: SIZES.regular },
  t14b: { fontSize: 14, lineHeight: 20, fontWeight: SIZES.bold },
  t14r: { fontSize: 14, lineHeight: 20, fontWeight: SIZES.regular },
  t12b: { fontSize: 12, lineHeight: 16, fontWeight: SIZES.bold },
  t12r: { fontSize: 12, lineHeight: 16, fontWeight: SIZES.regular },
  t11r: { fontSize: 11, lineHeight: 13, fontWeight: SIZES.regular },
  h4: { fontSize: 34, lineHeight: 40, fontWeight: SIZES.bold },
};

const appTheme = { COLOR, SIZES, FONTS };

export default appTheme;
