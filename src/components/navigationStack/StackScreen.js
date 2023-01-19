import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, Platform } from 'react-native';
import { SCREEN_NAME, COLOR, PAN_CONNECT } from '../../constants';
import { navigationRef } from 'components/navigation/rootNavigation';

// import Screen

import OnBoardingScreen from '../../screens/SignUp/OnBoardingScreen';
import CreatePassWordScreen from '../../screens/SignUp/CreatePassWordScreen';
import SetupWalletScreen from '../../screens/SignUp/SetupWalletScreen';
import SecureYourWalletScreen from '../../screens/createNewWallet/SecureYourWalletScreen';
import ConfirmPasswordScreen from '../../screens/ConfirmPasswordScreen';
import ViewSecretRecoveryPhrase from '../../screens/createNewWallet/ViewSecretRecoveryPhraseScreen';
import ConfirmPassphrase from '../../screens/createNewWallet/ConfirmPassphrase/ConfirmPassphrase';
import WalletReadyScreen from '../../screens/WalletReadyScreen';
import SplashScreen from '../../screens/Splash/SplashScreen';
import LoginScreen from '../../screens/SignIn/LoginScreen';
import LockedScreen from '../../screens/SignIn/LockedScreen';
import ImportWalletScreen from '../../screens/importExistingWallet/ImportWalletScreen';
import ImportWalletMultiChainOrSignChainScreen from '../../screens/importExistingWallet/ImportWalletMultiChainOrSignChainScreen';
import HomeScreen from '../../screens/Home/HomeScreen';
import GuidanceScreen from '../../screens/importFromExtension/GuidanceScreen';
import TransactionHistoryScreen from '../../screens/TransactionHistory/TransactionHistoryScreen';
import TransactionDetailScreen from '../../screens/TransactionHistory/TransactionDetailScreen';
import NetworkErrorScreen from '../../screens/NetWorkErrorScreen/NetworkErrorScreen';
import WalletConnectSessionsScreen from 'screens/WalletConnectSessionsScreen';
import WalletConnectConnectedScreen from 'screens/WalletConnectSessionsScreen/WalletConnectConnectedDetail';
import SignatureRequestScreen from 'screens/WalletConnectSessionsScreen/SignatureRequest';
import ConfirmTransactionScreen from 'screens/WalletConnectSessionsScreen/ConfirmTransaction';

import { storage } from '../../databases';
import Constants from '../../constants/constants';
import NavigationTabs from '../navigation/navigationTabs';
import TokenDetail from '../../screens/Home/TokenDetail/TokenDetail';
import WalletList from '../../screens/Manage Wallet/WalletList/WalletList';
import WalletDetail from '../../screens/Manage Wallet/WalletDetail/WalletDetail';
import ConfirmConnect from '../../screens/PanConnect/Connect';
import ConfirmDappTransaction from 'screens/SDK Tokens/ConfirmDappTransaction';
import DeleteSuccess from '../../screens/SignIn/ResetWalletScreen/DeleteSuccess';
import ViewSecretRecovery from '../../screens/Manage Wallet/WalletDetail/ViewSecretRecovery';
import ViewAddressQRCode from '../../screens/Manage Wallet/WalletDetail/ViewAddressQRCode';
import SelectToken from '../../screens/Manage Token/SelectToken';
import ImportCustomToken from '../../screens/Manage Token/ImportCustomToken';
import SendToken from '../../screens/SendToken/SendToken';
import ConfirmSend from '../../screens/SendToken/ConfirmSendToken';
import SendSuccess from 'screens/SendToken/SendSuccess';
import ChooseToken from '../../screens/Receive Token/ChooseToken';
import GeneralSettingScreen from '../../screens/Setting/GeneralSettingScreen';
import AboutPanWalletScreen from '../../screens/Setting/AboutPanWalletScreen';
import ChooseLanguageScreen from '../../screens/Setting/ChooseLanguageScreen';
import ReceiveDetail from '../../screens/Receive Token/ReceiveDetail';
import ChooseCurrencyScreen from '../../screens/Setting/ChooseCurrencyScreen';
import SecurityAndPrivacy from '../../screens/Setting/SecurityAndPrivacySettings/SecurityAndPrivacy';
import AutoLock from '../../screens/Setting/SecurityAndPrivacySettings/AutoLock';
import LockMethod from '../../screens/Setting/SecurityAndPrivacySettings/LockMethod';
import ResetPasswordSuccess from '../../screens/Setting/SecurityAndPrivacySettings/ResetPasswordSuccess';
import WalletConnectConfirm from 'screens/WalletConnectSessionsScreen/WalletConnectConfirm';
import ImportNFTs from 'screens/Manage NFTs/ImportNFT';
import NftCollectionElement from 'screens/Home/NftCollectionElement';
import NftDetail from 'screens/Home/NftDetail';
import SendNftScreen from 'screens/SendNft/SendNftScreen';
import SendNftSuccessScreen from 'screens/SendNft/SendNftSuccessScreen';
import ConfirmSendNftScreen from 'screens/SendNft/ConfirmSendNftScreen';
import SendNftTransactionDetailScreen from 'screens/TransactionHistory/SendNftTransactionDetailScreen';
import ConfirmDappTransactionScreen from 'screens/SDK NFTs/ConfirmDappTransactionScreen';
import ConfirmDappTransactionBoxScreen from 'screens/SDK Box/ConfirmDappTransactionBoxScreen';
import ApproveAllTransactionScreen from 'screens/SDK Approve/ApproveAllTransactionScreen';
import ApproveTokenScreen from 'screens/SDK Approve/ApproveTokenScreen';
import ConfirmYourPasswordScreen from 'screens/createNewWallet/ConfirmYourPasswordScreen';
import ResetPasswordSetting from 'screens/Setting/SecurityAndPrivacySettings/ResetPasswordSetting';
import ConfirmUnStakeTransactionScreen from 'screens/SDK NFTs/ConfirmUnStakeTransactionScreen';

const Stack = createNativeStackNavigator();

const StackScreen = () => {
  const [remainTime, setRemainTime] = useState(0);

  //save CurrentDate when open app
  const saveCurrentDate = () => {
    const currentDate = new Date().getTime();
    storage.set(Constants.dateTimeOpenAppKey, currentDate);
  };

  //if remainTime
  const checkRemainTimeLockedScreen = () => {
    if (storage.getBoolean(Constants.didShowLockedScreenKey) === true) {
      const timeWhenOpenLockedScreen = storage.getNumber(
        Constants.dateTimeLockedKey,
      );
      const timeWhenOpenApp = storage.getNumber(Constants.dateTimeOpenAppKey);
      if (timeWhenOpenLockedScreen !== 'undefined') {
        const time = timeWhenOpenApp - timeWhenOpenLockedScreen;
        if (time <= 0) {
          setRemainTime(0);
        } else {
          setRemainTime(time);
        }
      } else {
        setRemainTime(Constants.lockedTime);
      }
      storage.set(Constants.remainTimeKey, remainTime);
    }
  };

  const gotoScreen = async () => {
    await saveCurrentDate();
    await checkRemainTimeLockedScreen();
  };

  useEffect(() => {
    gotoScreen().done();
  });

  return (
    <NavigationContainer
      theme={{ colors: { background: COLOR.black } }}
      ref={navigationRef}>
      <StatusBar
        translucent={true}
        backgroundColor={COLOR.backgroundStatusBar}
        barStyle="light-content"
      />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'ios' ? null : 'slide_from_right',
          gestureEnabled: false,
        }}
        animationEnabled={true}>
        <Stack.Screen
          name={SCREEN_NAME.splashScreen}
          component={SplashScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.onBoardingScreen}
          component={OnBoardingScreen}
        />

        <Stack.Screen name={'Connect'} component={ConfirmConnect} />

        <Stack.Screen
          name={SCREEN_NAME.createPassWordScreen}
          component={CreatePassWordScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.setupWalletScreen}
          component={SetupWalletScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.secureYourWalletScreen}
          component={SecureYourWalletScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.confirmPasswordScreen}
          component={ConfirmPasswordScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.confirmYourPasswordScreen}
          component={ConfirmYourPasswordScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.viewSecretRecoveryPhrase}
          component={ViewSecretRecoveryPhrase}
        />

        <Stack.Screen
          name={SCREEN_NAME.confirmPassPhrase}
          component={ConfirmPassphrase}
        />

        <Stack.Screen name={SCREEN_NAME.loginScreen} component={LoginScreen} />

        <Stack.Screen
          name={SCREEN_NAME.importWalletScreen}
          component={ImportWalletScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.importWalletMultiChainOrSignChainScreen}
          component={ImportWalletMultiChainOrSignChainScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.lockedScreen}
          component={LockedScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.resetPasswordScreen}
          component={ResetPasswordSetting}
        />

        <Stack.Screen
          name={SCREEN_NAME.navigationBottomTab}
          component={NavigationTabs}
        />

        <Stack.Screen name={SCREEN_NAME.homeScreen} component={HomeScreen} />

        <Stack.Screen
          name={SCREEN_NAME.tokenDetailScreen}
          component={TokenDetail}
        />

        <Stack.Screen
          name={SCREEN_NAME.guidanceScreen}
          component={GuidanceScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.walletReadyScreen}
          component={WalletReadyScreen}
        />

        <Stack.Screen name={SCREEN_NAME.walletList} component={WalletList} />

        <Stack.Screen
          name={SCREEN_NAME.walletDetail}
          component={WalletDetail}
        />

        <Stack.Screen
          name={SCREEN_NAME.deleteSuccessScreen}
          component={DeleteSuccess}
        />

        <Stack.Screen
          name={SCREEN_NAME.viewSecretRecoveryScreen}
          component={ViewSecretRecovery}
        />

        <Stack.Screen
          name={SCREEN_NAME.viewAddressQRCode}
          component={ViewAddressQRCode}
        />

        <Stack.Screen
          name={SCREEN_NAME.transactionHistoryScreen}
          component={TransactionHistoryScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.transactionDetailScreen}
          component={TransactionDetailScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.sendNftTransactionDetailScreen}
          component={SendNftTransactionDetailScreen}
        />

        <Stack.Screen name={SCREEN_NAME.selectToken} component={SelectToken} />

        <Stack.Screen
          name={SCREEN_NAME.importCustomToken}
          component={ImportCustomToken}
        />

        <Stack.Screen name={SCREEN_NAME.sendToken} component={SendToken} />

        <Stack.Screen name={SCREEN_NAME.confirm_Send} component={ConfirmSend} />

        <Stack.Screen
          name={SCREEN_NAME.networkErrorScreen}
          component={NetworkErrorScreen}
        />

        <Stack.Screen name={SCREEN_NAME.send_success} component={SendSuccess} />

        <Stack.Screen
          name={SCREEN_NAME.chooseTokenToReceive}
          component={ChooseToken}
        />

        <Stack.Screen
          name={SCREEN_NAME.receiveTokenDetail}
          component={ReceiveDetail}
        />

        <Stack.Screen
          name={SCREEN_NAME.generalSettingScreen}
          component={GeneralSettingScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.walletConnectSessions}
          component={WalletConnectSessionsScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.walletConnectConfirm}
          component={WalletConnectConfirm}
        />

        <Stack.Screen
          name={SCREEN_NAME.walletConnectConnected}
          component={WalletConnectConnectedScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.signatureRequest}
          component={SignatureRequestScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.confirmTransaction}
          component={ConfirmTransactionScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.aboutPanWalletScreen}
          component={AboutPanWalletScreen}
        />
        <Stack.Screen
          name={PAN_CONNECT.screen_name.transfer}
          component={ConfirmDappTransaction}
        />
        <Stack.Screen
          name={SCREEN_NAME.chooseLanguageScreen}
          component={ChooseLanguageScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.chooseCurrencyScreen}
          component={ChooseCurrencyScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.securityAndPrivacyScreen}
          component={SecurityAndPrivacy}
        />

        <Stack.Screen name={SCREEN_NAME.autoLockScreen} component={AutoLock} />

        <Stack.Screen
          name={SCREEN_NAME.lockMethodScreen}
          component={LockMethod}
        />

        <Stack.Screen
          name={SCREEN_NAME.resetPasswordSuccess}
          component={ResetPasswordSuccess}
        />

        <Stack.Screen
          name={SCREEN_NAME.nftCollectionElement}
          component={NftCollectionElement}
        />

        <Stack.Screen name={SCREEN_NAME.nftDetail} component={NftDetail} />
        <Stack.Screen name={SCREEN_NAME.sendNft} component={SendNftScreen} />
        <Stack.Screen
          name={SCREEN_NAME.sendNftSuccess}
          component={SendNftSuccessScreen}
        />
        <Stack.Screen
          name={SCREEN_NAME.confirmSendNft}
          component={ConfirmSendNftScreen}
        />

        <Stack.Screen name={SCREEN_NAME.importNFTs} component={ImportNFTs} />

        <Stack.Screen
          name={SCREEN_NAME.confirmDappTransactionNftScreen}
          component={ConfirmDappTransactionScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.confirmDappTransactionBoxScreen}
          component={ConfirmDappTransactionBoxScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.approveAllTransactionScreen}
          component={ApproveAllTransactionScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.approveTokenScreen}
          component={ApproveTokenScreen}
        />

        <Stack.Screen
          name={SCREEN_NAME.confirmUnStakeTransactionScreen}
          component={ConfirmUnStakeTransactionScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackScreen;
