const { Platform, NativeModules, Linking } = require('react-native');
import { navigationRef } from 'components/navigation/rootNavigation';

export const onOpenLinkToDApp = url => {
  if (Platform.OS === 'android') {
    NativeModules.ConnectWalletModule.openLinkToDApp(url);
    navigationRef.current.goBack();
  } else {
    Linking.openURL(url)
      .catch(error => console.error(error))
      .finally(() => navigationRef.current.goBack());
  }
};
