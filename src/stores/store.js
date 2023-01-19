import { configureStore } from '@reduxjs/toolkit';
import passwordSlice from './reducer/passwordSlice';
import isVisibleModalSlice from './reducer/isVisibleModalSlice';
import isVisibleChangeWalletNameSlice from './reducer/isVisiableChangeWalletName';
import addressSlice from './reducer/addressSlice';
import connectDappSlice from './reducer/connectDappSlice';
import isChangeWalletNameSlice from './reducer/isChangeWalletNameSlice';
import walletNameSlice from './reducer/walletNameSlice';
import BundleSessionSlice from './reducer/BundleSessionSlice';
import isShowResetPasswordSlice from './reducer/isShowResetPasswordSlice';
import TransactionSlice from './reducer/TransactionSlice';
import fiatCurrencySLice from './reducer/fiatCurrencySLice';
import autoLockValueSlice from './reducer/autoLockValueSlice';
import lockMethodValueSlice from './reducer/lockMethodValueSlice';
import isShowLabelUnLockWithBiometricSlice from './reducer/isShowLabelUnLockWithBiometricSlice';
import showChangePasswordSCSlice from './reducer/showChangePasswordSCSlice';
import navigationEventSlice from './reducer/navigationEventSlice';
import deleteThisWalletModalSlice from './reducer/deleteThisWalletModalSlice';
import hiddenUnlockSignInSlice from './reducer/hiddenUnlockSignInSlice';
import walletConnect from './reducer/walletConnect';
import dataListWalletSlice from 'stores/reducer/dataListWalletSlice';
import nftErrorSlice from 'stores/reducer/nftErrorSlice';
import transferLoadingSlice from './reducer/transferLoadingSlice';
import isFinishTimeoutSlice from 'stores/reducer/isFinishTimeoutSlice';

export const store = configureStore({
  reducer: {
    password: passwordSlice,
    isVisibleModal: isVisibleModalSlice,
    accountAddress: addressSlice,
    params: connectDappSlice,
    isVisibleChangeWalletName: isVisibleChangeWalletNameSlice,
    isChangeWalletName: isChangeWalletNameSlice,
    walletName: walletNameSlice,
    bundles: BundleSessionSlice,
    isShowResetPassWord: isShowResetPasswordSlice,
    transaction: TransactionSlice,
    fiatCurrency: fiatCurrencySLice,
    autoLockValue: autoLockValueSlice,
    lockMethodValue: lockMethodValueSlice,
    isShowLabelUnLockWithBiometric: isShowLabelUnLockWithBiometricSlice,
    showChangePasswordSC: showChangePasswordSCSlice,
    navigationEven: navigationEventSlice,
    deleteThisWalletModal: deleteThisWalletModalSlice,
    hiddenUnlockSignIn: hiddenUnlockSignInSlice,
    walletConnect: walletConnect,
    dataListWallet: dataListWalletSlice,
    nftErrorLabel: nftErrorSlice,
    transferLoading: transferLoadingSlice,
    isFinishTimeout: isFinishTimeoutSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
