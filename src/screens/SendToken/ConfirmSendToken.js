import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ScrollView,
} from 'react-native';

import Modal from 'react-native-modal';

import {
  IMAGES,
  ICONS,
  SIZES,
  FONTS,
  COLOR,
  SCREEN_NAME,
  STRINGS,
} from '../../constants';
import { compactAddress } from 'utils/util';
import CustomButton from '../../components/CustomButton/CustomButton';
import { walletSend } from 'walletCore/sendToken';
import LoadingPopup from '../createNewWallet/ConfirmPassphrase/ConfirmPhraseLoading';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { t } from 'i18next';
import { ethGasLimit, tokenGasLimit } from '../../constants/walletConst';
import { getFeeData, getGasPrice } from 'utils/gas.util';
import Web3 from 'web3';

const ConfirmSend = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  const formatNumber = new Intl.NumberFormat('en-En', {
    style: 'currency',
    currency: fiatCurrency,
  });
  const isSendMax = route.params.isSendMax;
  const asset = route.params.asset;

  const gas = route.params.gas.gas / 10 ** route.params.gas.coin.decimals;

  const [isLoad, setIsLoad] = useState(false);

  const createAlert = mess => {
    return Alert.alert('Error', mess.toString(), [
      {
        text: 'OK',
        onPress: () => navigation.goBack(route.params.screen),
        style: 'cancel',
      },
    ]);
  };

  const handleConfirmSendToken = async () => {
    setIsLoad(true);
    const gasPrice = await getGasPrice(route.params.coin.symbol);
    const lastBaseFeePerGas =
      route.params.coin.symbol === 'ETH' ? await getFeeData() : 0;
    //TODO: if send max total ETH : maxPriorityFeePerGas = maxFeePerGas = maxPriorityFeePerGas - lastBaseFeePerGas; else maxFeePerGas = maxPriorityFeePerGas +  lastBaseFeePerGas (maxPriorityFeePerGas = gasOptionTip + gasPrice)
    const maxPriorityFeePerGas =
      parseInt(route.params.gas.gas / ethGasLimit, 10) -
      parseInt(lastBaseFeePerGas, 10);
    const maxFeePerGas = isSendMax
      ? maxPriorityFeePerGas
      : maxPriorityFeePerGas + parseInt(lastBaseFeePerGas, 10);
    const amount =
      route.params.coin.decimals === 18
        ? Web3.utils.toWei(route.params.asset, 'ether')
        : asset * Math.pow(10, route.params.gas.coin.decimals);
    try {
      walletSend(
        route.params.wallet,
        route.params.to,
        amount,
        route.params.gas.gas,
        route.params.coin,
        gasPrice,
        maxPriorityFeePerGas,
        maxFeePerGas,
      )
        .then(txHash => {
          const txInfo = {
            id: typeof txHash === 'object' ? txHash.transactionHash : txHash,
            type: 'Send',
            time: new Date().getTime(),
            from: route.params.wallet.address,
            to: route.params.to,
            amount: {
              asset: Number(asset),
              token: route.params.coin,
            },
            gas: {
              gas: gas,
              token: route.params.gas.coin,
            },
          };
          navigation.navigate(SCREEN_NAME.send_success, {
            tx: txInfo,
            screen: route.params.screen,
            walletID: route.params.walletID,
            addressID: route.params.wallet._id,
          });
        })
        .catch(error => {
          createAlert(error);
        })
        .finally(() => {
          setIsLoad(false);
        });
    } catch (error) {
      createAlert(error);
      setIsLoad(false);
    }
  };

  return (
    <ImageBackground source={IMAGES.homeBackGround} style={{ flex: 1 }}>
      <ScrollView>
        <Header />

        <View
          style={{
            marginTop: 34,
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: COLOR.white,
              ...FONTS.t30b,
              textAlign: 'center',
            }}>
            {`-${asset} ${route.params.coin.symbol}`}
          </Text>
          <Text style={{ color: COLOR.textSecondary, ...FONTS.t16b }}>
            {`~ ${formatNumber.format(route.params.fiasToken * asset)}`}
          </Text>
        </View>

        <SendInfoItem
          label={t(STRINGS.from)}
          value={compactAddress(route.params.wallet.address)}
          style={{ marginTop: SIZES.simpleMargin * 2 }}
        />
        <SendInfoItem
          label={t(STRINGS.to)}
          value={compactAddress(route.params.to)}
          style={{ marginTop: SIZES.simpleMargin }}
        />
        <SendInfoItem
          label={t(STRINGS.transactionFee)}
          style={{ marginTop: SIZES.simpleMargin * 2.5 }}
          value={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: COLOR.white, ...FONTS.t16r }}>
                {`${parseFloat(gas.toFixed(10))} ${
                  route.params.gas.coin.symbol
                }`}
              </Text>
              <Text
                style={{
                  paddingLeft: 4,
                  color: COLOR.textSecondary,
                  ...FONTS.t12r,
                }}>
                {`(${formatNumber.format(gas * route.params.fiasCoin)})`}
              </Text>
            </View>
          }
        />
        <SendInfoItem
          label={t(STRINGS.totalAmount)}
          value={formatNumber.format(route.params.total)}
          style={{ marginTop: SIZES.simpleMargin * 3 }}
          valueProps={{ style: FONTS.t20b }}
        />
      </ScrollView>

      <ConfirmButton onPress={handleConfirmSendToken} />
      <Modal
        statusBarTranslucent={true}
        isVisible={isLoad}
        backdropOpacity={0.6}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropColor={COLOR.black}
        deviceHeight={SIZES.height}>
        {LoadingPopup(IMAGES.clockLoading, '', '')}
      </Modal>
    </ImageBackground>
  );
};

const Header = () => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        marginTop: 60,
      }}>
      <TouchableOpacity
        onPress={navigation.goBack}
        style={{
          width: 15,
          height: 15,
          marginLeft: SIZES.simpleSpace + 3,
        }}>
        <Image
          source={ICONS.backButton}
          style={{ marginTop: SIZES.simpleSpace + 5 }}
        />
      </TouchableOpacity>
      <Text
        style={{
          alignSelf: 'center',
          ...FONTS.t16b,
          color: COLOR.white,
        }}>
        {t(STRINGS.confirm_sending)}
      </Text>
    </View>
  );
};

const SendInfoItem = ({
  label,
  value,
  style,
  valueProps = {},
  ...otherProps
}) => {
  const { style: valueStyle, ...otherValueProps } = valueProps;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: SIZES.simpleMargin,
        },
        style,
      ]}
      {...otherProps}>
      <Text style={{ color: COLOR.textSecondary, ...FONTS.t14r }}>{label}</Text>
      <Text
        style={[{ color: COLOR.white, ...FONTS.t16r }, valueStyle]}
        {...otherValueProps}>
        {value}
      </Text>
    </View>
  );
};

const ConfirmButton = ({ onPress, style, ...otherProps }) => {
  const { t } = useTranslation();

  return (
    <View
      style={[
        {
          marginLeft: SIZES.simpleMargin,
          width: SIZES.width,
          height: SIZES.buttonHeight,
          marginBottom: 45,
        },
        style,
      ]}
      {...otherProps}>
      <CustomButton
        onPress={onPress}
        width={SIZES.width - SIZES.simpleMargin * 2}
        height={SIZES.buttonHeight}
        label={t(STRINGS.confirm)}
      />
    </View>
  );
};

ConfirmButton.propTypes = {
  onPress: PropTypes.func,
  style: PropTypes.object,
};

SendInfoItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node,
  style: PropTypes.object,
  valueProps: PropTypes.shape({
    style: PropTypes.object,
  }),
};

export default ConfirmSend;
