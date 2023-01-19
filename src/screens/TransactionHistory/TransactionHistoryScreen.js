import React, { useEffect, useState } from 'react';
import {
  FlatList,
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
  SCREEN_NAME,
  SIZES,
  STRINGS,
  TRANSACTION,
} from '../../constants';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { DAORepository } from '../../databases';
import DatePicker from '../../components/DateTimePicker/DatePicker';
import Modal from 'react-native-modal';
import PropTypes from 'prop-types';
import { formatDateString } from 'utils/format.util';

const TransactionHistoryScreen = ({ route, navigation }) => {
  const { t } = useTranslation();

  const { id } = route.params;

  const [displayDateFrom, setDisplayFrom] = useState(false);
  const [displayDateTo, setDisplayTo] = useState(false);
  const [transactionData, setTransactionData] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [chooseDateFrom, setChooseDateFrom] = useState(false);
  const [chooseDateTo, setChooseDateTo] = useState(false);
  const [isVisibleDateDialog, setIsVisibleDateDialog] = useState(false);

  const buttonBack = () => {
    return (
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image source={ICONS.backButton} />
      </TouchableOpacity>
    );
  };

  //filter container

  const containerDateFrom = () => {
    return displayDateFrom ? (
      <View>
        <Text style={[FONTS.t12b, { color: COLOR.textSecondary }]}>
          {t(STRINGS.from)}
        </Text>

        <Text style={[FONTS.t14r, styles.date_text]}>
          {formatDate(dateFrom)}
        </Text>
      </View>
    ) : (
      <Text style={[FONTS.t14b, { color: COLOR.white }]}>
        {t(STRINGS.from)}
      </Text>
    );
  };

  const containerDateTo = () => {
    return displayDateTo ? (
      <View>
        <Text style={[FONTS.t12b, { color: COLOR.textSecondary }]}>
          {t(STRINGS.to)}
        </Text>

        <Text style={[FONTS.t14r, styles.date_text]}>{formatDate(dateTo)}</Text>
      </View>
    ) : (
      <Text style={[FONTS.t14b, { color: COLOR.white }]}>{t(STRINGS.to)}</Text>
    );
  };

  const buttonContainResetFilter = () => {
    return (
      <View style={{ flexDirection: 'row', width: '100%' }}>
        <TouchableOpacity
          style={[
            styles.button_filter,
            styles.button_reset,
            { display: displayDateFrom && displayDateTo ? 'flex' : 'none' },
          ]}
          onPress={() => {
            setDisplayFrom(false);
            setDisplayTo(false);
            getTransactionHistory();
          }}>
          <Text style={[FONTS.t16b, styles.search, { color: COLOR.shade3 }]}>
            {t(STRINGS.reset)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button_filter,
            {
              backgroundColor:
                displayDateFrom && displayDateTo
                  ? COLOR.stateDefault
                  : COLOR.actionDisabled,
            },
          ]}
          onPress={() => {
            if (displayDateFrom && displayDateTo) {
              filterTransactionHistoryByDate();
            }
          }}>
          <Text style={[FONTS.t16b, styles.search]}>{t(STRINGS.filter)}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const filterTransactionHistoryByDate = () => {
    const dateF = new Date(
      dateFrom.getFullYear(),
      dateFrom.getMonth(),
      dateFrom.getDate(),
      0,
      0,
      0,
      0,
    );
    const dateT = new Date(
      dateTo.getFullYear(),
      dateTo.getMonth(),
      dateTo.getDate(),
      23,
      59,
      59,
      999,
    );
    if (
      !displayDateFrom ||
      !displayDateTo ||
      dateF.getTime() > dateT.getTime()
    ) {
      setIsVisibleDateDialog(true);
    } else {
      DAORepository.getTransactionHistoryFilterDate(id, dateF, dateT).then(
        transaction => {
          setTransactionData(transaction);
        },
      );
    }
  };

  const invalidDateDialog = () => {
    return (
      <Modal
        isVisible={isVisibleDateDialog}
        statusBarTranslucent={true}
        backdropOpacity={0.5}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropColor={COLOR.black}
        deviceHeight={SIZES.heightScreen}
        transparent={true}>
        <View style={styles.invalid_date_dialog_container}>
          <Text style={[FONTS.t16b, styles.invalid_date_dialog_title]}>
            {t(STRINGS.invalid_date_input_title)}
          </Text>

          <Text style={[FONTS.t14r, styles.invalid_date_dialog_description]}>
            {t(STRINGS.invalid_date_input_description)}
          </Text>

          <View style={styles.invalid_date_dialog_view_div} />

          <TouchableOpacity onPress={() => setIsVisibleDateDialog(false)}>
            <Text style={[FONTS.t14b, styles.invalid_date_dialog_got_it]}>
              {t(STRINGS.ok_got_it)}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  //transaction container

  const transactionHistory = () => {
    return transactionData.length === 0 ? (
      <View
        style={[styles.container_transaction, { justifyContent: 'center' }]}>
        <Image
          source={IMAGES.assetRecordImage}
          resizeMode={'cover'}
          style={styles.img_asset_record}
        />

        <Text style={[FONTS.t14r, { color: COLOR.textTermsCondition }]}>
          {t(STRINGS.no_transactions_yet)}
        </Text>

        <Text style={[FONTS.t12r, styles.text_no_transaction]}>
          {t(STRINGS.transaction_description)}
        </Text>
      </View>
    ) : (
      <FlatList
        style={{ width: '100%', marginBottom: 12 }}
        data={transactionData}
        extraData={transactionData}
        renderItem={item => renderItemTransaction(item)}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderItemTransaction = item => (
    <TouchableOpacity
      style={styles.renderItem}
      onPress={() => {
        navigation.navigate(SCREEN_NAME.transactionDetailScreen, {
          action: item.item.actionTransaction,
          status: item.item.statusTransaction,
          date: `${item.item.time.toLocaleTimeString('en', {
            hour12: false,
          })} - ${formatDateString(item.item.time)}`,
          from: item.item.address_from,
          to: item.item.address_to,
          amount: item.item.amount,
          tokenUnit: item.item.token,
          transactionFee: item.item.transactionFee,
          coinUnit: item.item.coinByChain,
          idNft: item.item.idNft,
          nameNft: item.item.nameNft,
        });
      }}>
      <Image
        source={getStatusActionSend(item.item.actionTransaction)}
        resizeMode="contain"
        style={{ height: '200%', marginTop: 8 }}
      />

      <View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[FONTS.t14r, { color: COLOR.white, marginEnd: 8 }]}>
            {t(getTextLanguageKey(item.item.actionTransaction))}
          </Text>

          {statusTransaction(item.item.statusTransaction)}
        </View>

        <Text
          style={[
            FONTS.t12r,
            { color: COLOR.textTermsCondition, marginTop: 6 },
          ]}>
          {item.item.time.toLocaleTimeString('en', { hour12: false })}
          {' - '}
          {formatDateString(item.item.time)}
        </Text>
      </View>

      <View style={{ flex: 1 }} />

      {Boolean(item.item.amount) && (
        <Text
          style={[
            FONTS.t16r,
            styles.text_amount,
            {
              color:
                item.item.statusTransaction === TRANSACTION.failed
                  ? COLOR.gray5
                  : COLOR.white,
            },
          ]}>
          {getTotalAmount(item.item.amount, item.item.actionTransaction)}
          {item.item.token}
        </Text>
      )}
    </TouchableOpacity>
  );

  const getTextLanguageKey = action => {
    switch (action) {
      case TRANSACTION.send: {
        return STRINGS.send;
      }

      case TRANSACTION.receive: {
        return STRINGS.receive;
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

  const getStatusActionSend = action => {
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

  const statusTransaction = status => {
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

  const getTotalAmount = (amount, action) => {
    switch (action) {
      case TRANSACTION.send:
      case TRANSACTION.transferToken:
      case TRANSACTION.depositToken: {
        return '-' + parseFloat(amount.toFixed(7)) + ' ';
      }

      case TRANSACTION.withdrawToken: {
        return '+' + parseFloat(amount.toFixed(7)) + ' ';
      }
    }
  };

  const getTransactionHistory = () => {
    DAORepository.getTransactionHistoryByWallet(id).then(transaction => {
      setTransactionData(transaction);
    });
  };

  useEffect(() => {
    getTransactionHistory();
  }, []);

  useEffect(() => {
    if (displayDateFrom || displayDateTo) {
      setTransactionData([]);
    }
  }, [displayDateFrom, displayDateTo]);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={IMAGES.homeBackGround}
        style={{ flex: 1 }}
        resizeMode="cover">
        <Animated.View style={styles.container}>
          {/*header*/}
          <View style={styles.header}>
            {buttonBack()}

            <Text style={[FONTS.t16b, styles.title]}>
              {t(STRINGS.transaction_history)}
            </Text>
          </View>

          {/*filter*/}
          <View style={styles.date_container}>
            <TouchableOpacity
              onPress={() => {
                setShowDatePicker(true);
                setChooseDateFrom(true);
                setChooseDateTo(false);
              }}
              style={[styles.date, { marginEnd: SIZES.simpleMargin }]}>
              {containerDateFrom()}

              <Image
                source={ICONS.calendar}
                resizeMode="cover"
                style={{
                  marginTop: SIZES.simpleMargin,
                  marginBottom: SIZES.simpleMargin,
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowDatePicker(true);
                setChooseDateTo(true);
                setChooseDateFrom(false);
              }}
              style={[styles.date]}>
              {containerDateTo()}

              <Image
                source={ICONS.calendar}
                resizeMode="cover"
                style={{
                  marginTop: SIZES.simpleMargin,
                  marginBottom: SIZES.simpleMargin,
                }}
              />
            </TouchableOpacity>
          </View>

          {buttonContainResetFilter()}

          {/*Transaction history*/}
          {transactionHistory()}
        </Animated.View>
      </ImageBackground>

      {/*date picker dialog*/}
      <DatePicker
        display={showDatePicker}
        disable={() => setShowDatePicker(false)}
        getDate={date => {
          if (chooseDateFrom) {
            setChooseDateFrom(false);
            setDisplayFrom(true);
            setDateFrom(date);
          }

          if (chooseDateTo) {
            setChooseDateTo(false);
            setDisplayTo(true);
            setDateTo(date);
          }
        }}
      />

      {/*invalid date input*/}
      {invalidDateDialog()}
    </View>
  );
};

const formatDate = date => {
  return typeof date !== 'undefined'
    ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
    : '';
};

TransactionHistoryScreen.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingStart: SIZES.simpleMargin,
    paddingEnd: SIZES.simpleMargin,
  },

  header: {
    marginTop: SIZES.marginStatusbar,
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    flex: 1,
    textAlign: 'center',
    color: COLOR.white,
  },

  wallet: {
    backgroundColor: COLOR.neutralSurface2,
    flexDirection: 'row',
    marginTop: SIZES.heightScreen * 0.042,
    borderRadius: SIZES.heightScreen * 0.01,
    padding: SIZES.heightScreen * 0.01,
    justifyContent: 'space-between',
  },

  wallet_container: {
    justifyContent: 'space-evenly',
    marginStart: SIZES.heightScreen * 0.02,
  },

  wallet_name: {
    color: COLOR.white,
  },

  chain: {
    color: COLOR.textSecondary,
  },

  buttonChange: {
    color: COLOR.actionLink1,
  },

  date_container: {
    flexDirection: 'row',
    marginTop: SIZES.heightScreen * 0.042,
    justifyContent: 'space-between',
  },

  date: {
    flexDirection: 'row',
    backgroundColor: COLOR.neutral_grey_3,
    paddingStart: SIZES.heightScreen * 0.02,
    paddingEnd: SIZES.heightScreen * 0.02,
    borderRadius: SIZES.heightScreen * 0.01,
    flex: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  button_reset: {
    backgroundColor: COLOR.statesPressed,
    marginEnd: SIZES.simpleMargin,
  },

  button_filter: {
    flex: 1,
    backgroundColor: COLOR.actionDisabled,
    marginTop: SIZES.simpleMargin,
    marginBottom: SIZES.heightScreen * 0.025,
    borderRadius: SIZES.heightScreen * 0.01,
    alignItems: 'center',
    paddingTop: SIZES.heightScreen * 0.017,
    paddingBottom: SIZES.heightScreen * 0.017,
  },

  search: {
    color: COLOR.gray10,
  },

  container_transaction: {
    flex: 1,
    alignItems: 'center',
  },

  img_asset_record: {
    width: SIZES.heightScreen * 0.148,
    height: SIZES.heightScreen * 0.148,
  },

  text_no_transaction: {
    color: COLOR.textTermsCondition,
    textAlign: 'center',
    marginTop: 8,
  },

  renderItem: {
    flexDirection: 'row',
    backgroundColor: COLOR.neutralSurface2,
    marginTop: 12,
    borderRadius: 8,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },

  text_amount: { justifyContent: 'flex-end', marginEnd: 8 },

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

  date_text: {
    marginTop: 4,
    color: COLOR.white,
  },

  invalid_date_dialog_container: {
    backgroundColor: COLOR.simpleBackground,
    marginStart: SIZES.widthScreen * 0.021,
    marginEnd: SIZES.widthScreen * 0.021,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  invalid_date_dialog_title: {
    color: COLOR.white,
    marginTop: SIZES.heightScreen * 0.03,
    marginStart: SIZES.simpleMargin,
    marginEnd: SIZES.simpleMargin,
  },

  invalid_date_dialog_description: {
    color: COLOR.white,
    marginTop: SIZES.heightScreen * 0.015,
    marginStart: SIZES.simpleMargin,
    marginEnd: SIZES.simpleMargin,
  },

  invalid_date_dialog_view_div: {
    width: '100%',
    height: 1,
    backgroundColor: COLOR.gray5,
    marginTop: SIZES.heightScreen * 0.03,
  },

  invalid_date_dialog_got_it: {
    color: COLOR.white,
    marginTop: SIZES.heightScreen * 0.016,
    marginBottom: SIZES.heightScreen * 0.017,
  },

  bottom_sheet_header: {
    backgroundColor: COLOR.simpleBackground,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
    position: 'relative',
  },

  text_header: {
    textAlign: 'center',
    color: COLOR.white,
    marginTop: SIZES.simpleMargin,
    marginBottom: 15,
  },

  button_close_bottom_sheet: {
    position: 'absolute',
    end: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    marginEnd: 20,
  },
});

export default TransactionHistoryScreen;
