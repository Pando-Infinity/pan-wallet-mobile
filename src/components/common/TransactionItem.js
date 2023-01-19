import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONTS, TRANSACTION, STRINGS } from 'constants';
import { useTranslation } from 'react-i18next';
import { getTransactionIcon } from 'utils/util';
import { TransactionStatus } from 'components/common';

const TransactionItem = ({ type, status, dateTime, total, style, onPress }) => {
  const { t: getLabel } = useTranslation();

  const typeLabel = useMemo(() => {
    return getTypeLabel(type);
  }, [type]);

  const Icon = useMemo(() => {
    return getTransactionIcon(type);
  }, [type]);

  const isConfirmed = useMemo(() => {
    return TRANSACTION.confirm === status;
  }, [status]);

  return (
    <TouchableOpacity style={[styles.root, style]} onPress={onPress}>
      <View style={{ flexDirection: 'row' }}>
        {Icon ? <Icon /> : <></>}
        <View style={{ marginLeft: 16 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.transactionType}>{getLabel(typeLabel)}</Text>
            <TransactionStatus status={status} />
          </View>
          <Text style={styles.dateTime}>{dateTime}</Text>
        </View>
      </View>
      <Text style={isConfirmed ? styles.amount : styles.amountBlur}>
        {total}
      </Text>
    </TouchableOpacity>
  );
};

TransactionItem.propTypes = {
  type: PropTypes.oneOf(Object.values(TRANSACTION)),
  status: PropTypes.oneOf(Object.values(TRANSACTION)),
  dateTime: PropTypes.string,
  total: PropTypes.string,
  style: PropTypes.object,
  onPress: PropTypes.func,
};

export default TransactionItem;

const getTypeLabel = type => {
  switch (type) {
    case TRANSACTION.send:
      return STRINGS.send;
    case TRANSACTION.swap:
      return STRINGS.swap;
    case TRANSACTION.receive:
      return STRINGS.receive;
    default:
      return '';
  }
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderRadius: 8,
    backgroundColor: COLOR.neutralSurface2,
    width: '100%',
    padding: 8,
    marginBottom: 12,
  },
  transactionType: {
    ...FONTS.t14r,
    color: COLOR.white,
  },

  dateTime: {
    ...FONTS.t12r,
    color: COLOR.textSecondary,
    marginTop: 4,
  },
  amount: {
    ...FONTS.t16r,
    color: COLOR.white,
  },
  amountBlur: {
    ...FONTS.t16r,
    color: COLOR.gray5,
  },
});
