import React from 'react';
import PropTypes from 'prop-types';
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
import { compactAddress } from 'utils/util';
import { useNavigation, useRoute } from '@react-navigation/native';

const SendNftTransactionDetailScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const {
    action,
    status,
    date,
    from,
    to,
    tokenUnit,
    transactionFee,
    tokenId,
    tokenName,
  } = route.params;

  console.log(route.params);

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
      case TRANSACTION.send: {
        return IMAGES.sendImage;
      }

      case TRANSACTION.receive: {
        return IMAGES.receiveImage;
      }
    }
  };

  const getOperator = () => {
    switch (action) {
      case TRANSACTION.send: {
        return '-';
      }

      case TRANSACTION.receive: {
        return '+';
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
                {`${t(
                  action === TRANSACTION.send ? STRINGS.send : STRINGS.receive,
                )} ${tokenName}`}
              </Text>
            </View>

            {statusTransaction()}
          </View>

          <TransactionRowItem label={t(STRINGS.date)} value={date} />

          <TransactionRowItem
            label={t(STRINGS.from)}
            value={compactAddress(from)}
          />

          <TransactionRowItem
            label={t(STRINGS.to)}
            value={compactAddress(to)}
          />

          {tokenId === '' ? null : (
            <TransactionRowItem
              label={t(STRINGS.tokenId)}
              value={
                <>
                  <Text
                    style={{
                      color: COLOR.white,
                      ...FONTS.t16r,
                    }}>
                    {tokenId}
                  </Text>
                </>
              }
            />
          )}

          <TransactionRowItem
            label={t(STRINGS.transactionFee)}
            value={`${getOperator()}${transactionFee} ${tokenUnit}`}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

const TransactionRowItem = ({ label, value, style }) => {
  return (
    <View style={[styles.container_text_from, style]}>
      <Text style={[FONTS.t14r, { color: COLOR.textTermsCondition, flex: 1 }]}>
        {label}
      </Text>

      <Text style={[FONTS.t16r, { color: COLOR.white }]}>{value}</Text>
    </View>
  );
};

TransactionRowItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node,
  style: PropTypes.object,
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
    marginTop: SIZES.heightScreen * 0.04,
  },

  container_text_from: {
    flexDirection: 'row',
    marginStart: SIZES.simpleMargin,
    marginEnd: SIZES.simpleMargin,
    marginTop: SIZES.simpleMargin,
    alignItems: 'center',
  },
});

export default SendNftTransactionDetailScreen;
