import React from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  COLOR,
  FONTS,
  ICONS,
  IMAGES,
  SIZES,
  STRINGS,
  TRANSACTION,
} from '../../constants';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import stringFormat from 'components/StringFormat/StringFormat';
import { toFixed } from 'utils/transactionFeeShow';

const TransactionDetailScreen = ({ route, navigation }) => {
  const { t } = useTranslation();

  const {
    action,
    status,
    date,
    from,
    to,
    amount,
    tokenUnit,
    transactionFee,
    coinUnit,
    idNft,
    nameNft,
  } = route.params;

  const buttonBack = () => {
    return (
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image source={ICONS.backButton} />
      </TouchableOpacity>
    );
  };

  const statusTransaction = () => {
    switch (status) {
      case TRANSACTION.confirm: {
        return (
          <Text style={[FONTS.t12r, styles.text_confirm]}>
            {t(STRINGS.confirmed)}
          </Text>
        );
      }

      case TRANSACTION.pending: {
        return (
          <Text style={[FONTS.t12r, styles.text_pending]}>
            {t(STRINGS.pending)}
          </Text>
        );
      }

      case TRANSACTION.failed: {
        return (
          <Text style={[FONTS.t12r, styles.text_failed]}>
            {t(STRINGS.failed)}
          </Text>
        );
      }
    }
  };

  const getStatusActionSend = () => {
    switch (action) {
      case TRANSACTION.send:
      case TRANSACTION.approve:
      case TRANSACTION.transferToken:
      case TRANSACTION.depositToken:
      case TRANSACTION.buyBox:
      case TRANSACTION.unlockBox:
      case TRANSACTION.openBox:
      case TRANSACTION.sendBox:
      case TRANSACTION.sellNFT:
      case TRANSACTION.stakeNFT:
      case TRANSACTION.sendNFT:
      case TRANSACTION.cancelTransaction: {
        return IMAGES.sendImage;
      }

      case TRANSACTION.withdrawToken:
      case TRANSACTION.buyNFT:
      case TRANSACTION.unStakeNFT: {
        return IMAGES.receiveImage;
      }
    }
  };

  const getOperator = () => {
    switch (action) {
      case TRANSACTION.send:
      case TRANSACTION.transferToken:
      case TRANSACTION.depositToken: {
        return '-';
      }

      case TRANSACTION.withdrawToken: {
        return '+';
      }
    }
  };

  const getTextLanguageKey = action => {
    switch (action) {
      case TRANSACTION.send: {
        return STRINGS.sent_symbol;
      }

      case TRANSACTION.receive: {
        return STRINGS.receive_symbol;
      }

      case TRANSACTION.approve: {
        return STRINGS.approve;
      }

      case TRANSACTION.transferToken:
      case TRANSACTION.depositToken:
      case TRANSACTION.withdrawToken: {
        return STRINGS.transferToken;
      }

      case TRANSACTION.buyBox: {
        return STRINGS.buyBox;
      }

      case TRANSACTION.unlockBox: {
        return STRINGS.unlockBox;
      }

      case TRANSACTION.openBox: {
        return STRINGS.openBox;
      }

      case TRANSACTION.sendBox: {
        return STRINGS.sendBox;
      }

      case TRANSACTION.buyNFT:
      case TRANSACTION.sellNFT:
      case TRANSACTION.stakeNFT:
      case TRANSACTION.sendNFT:
      case TRANSACTION.unStakeNFT: {
        return STRINGS.transferNFT;
      }

      case TRANSACTION.cancelTransaction: {
        return STRINGS.cancelTransaction;
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={IMAGES.homeBackGround}
        style={{ flex: 1 }}
        resizeMode="cover">
        <View style={styles.container}>
          {/*header*/}
          <View style={styles.header}>
            {buttonBack()}

            <Text style={[FONTS.t16b, styles.title]}>
              {t(STRINGS.transaction_detail)}
            </Text>
          </View>

          <View style={styles.action_status_container}>
            <View style={styles.action_container}>
              <Image source={getStatusActionSend()} resizeMode="contain" />

              <Text style={[FONTS.t16r, styles.action_text]}>
                {stringFormat(t(getTextLanguageKey(action)), [
                  `${nameNft || tokenUnit?.toUpperCase()}`,
                ])}
              </Text>
            </View>

            {statusTransaction()}
          </View>

          {/*date/*/}
          <View style={styles.container_text_date}>
            <Text style={[FONTS.t14r, { color: COLOR.textTermsCondition }]}>
              {t(STRINGS.date)}
            </Text>

            <View style={{ flex: 1 }} />

            <Text style={[FONTS.t16r, { color: COLOR.white }]}>{date}</Text>
          </View>

          <View style={styles.container_text_from}>
            <Text style={[FONTS.t14r, { color: COLOR.textTermsCondition }]}>
              {t(STRINGS.from)}
            </Text>

            <View style={{ flex: 1 }} />

            <Text style={[FONTS.t16r, { color: COLOR.white }]}>
              {from.slice(0, 4)}
              {'...'}
              {from.slice(from.length - 4, from.length)}
            </Text>
          </View>

          <View style={styles.container_text_from}>
            <Text style={[FONTS.t14r, { color: COLOR.textTermsCondition }]}>
              {t(STRINGS.to)}
            </Text>

            <View style={{ flex: 1 }} />

            <Text style={[FONTS.t16r, { color: COLOR.white }]}>
              {to.slice(0, 4)}
              {'...'}
              {to.slice(to.length - 4, to.length)}
            </Text>
          </View>

          {nameNft && tokenUnit.toUpperCase() === 'SOL' ? null : (
            <View
              style={[
                styles.container_text_from,
                { marginTop: SIZES.heightScreen * 0.05 },
              ]}>
              <Text style={[FONTS.t14r, { color: COLOR.textTermsCondition }]}>
                {t(idNft ? STRINGS.tokenId : STRINGS.amount)}
              </Text>

              <View style={{ flex: 1 }} />

              {idNft ? (
                <Text style={[FONTS.t16r, { color: COLOR.white }]}>
                  #{idNft}
                </Text>
              ) : (
                <Text style={[FONTS.t16r, { color: COLOR.white }]}>
                  {amount !== 0 && getOperator()}
                  {parseFloat(amount.toFixed(10))} {tokenUnit?.toUpperCase()}
                </Text>
              )}
            </View>
          )}

          <View style={styles.container_text_from}>
            <Text style={[FONTS.t14r, { color: COLOR.textTermsCondition }]}>
              {t(STRINGS.transactionFee)}
            </Text>

            <View style={{ flex: 1 }} />

            <Text style={[FONTS.t16r, { color: COLOR.white }]}>
              -{parseFloat(toFixed(transactionFee.toFixed(10)))}{' '}
              {coinUnit?.toUpperCase()}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

TransactionDetailScreen.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    marginTop: SIZES.marginStatusbar,
    flexDirection: 'row',
    alignItems: 'center',
    marginStart: SIZES.simpleMargin,
    marginEnd: SIZES.simpleMargin,
  },

  title: {
    flex: 1,
    textAlign: 'center',
    color: COLOR.white,
  },

  action_status_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginEnd: SIZES.simpleMargin,
    alignItems: 'center',
    marginTop: SIZES.heightScreen * 0.052,
  },

  action_container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  action_text: {
    color: COLOR.white,
  },

  text_confirm: {
    color: COLOR.systemGreenLight1,
    backgroundColor: COLOR.systemGreenLight2,
    paddingTop: 2,
    paddingBottom: 2,
    paddingStart: 4,
    paddingEnd: 4,
    borderRadius: 4,
  },

  text_pending: {
    color: COLOR.systemYellowLight,
    backgroundColor: COLOR.systemYellowLight2,
    paddingTop: 2,
    paddingBottom: 2,
    paddingStart: 4,
    paddingEnd: 4,
    borderRadius: 4,
  },

  text_failed: {
    color: COLOR.systemRedLight,
    backgroundColor: COLOR.systemRedLight2,
    paddingTop: 2,
    paddingBottom: 2,
    paddingStart: 4,
    paddingEnd: 4,
    borderRadius: 4,
  },

  container_text_date: {
    flexDirection: 'row',
    marginStart: SIZES.simpleMargin,
    marginEnd: SIZES.simpleMargin,
    marginTop: 20,
  },

  container_text_from: {
    flexDirection: 'row',
    marginStart: SIZES.simpleMargin,
    marginEnd: SIZES.simpleMargin,
    marginTop: SIZES.simpleMargin,
    alignItems: 'center',
  },
});

export default TransactionDetailScreen;
