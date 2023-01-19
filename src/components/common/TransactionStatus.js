import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text } from 'react-native';
import { FONTS } from 'constants';
import { COLOR } from 'constants';
import { useTranslation } from 'react-i18next';
import { TRANSACTION } from 'constants';
import { STRINGS } from 'constants';

const TransactionStatus = ({ status }) => {
  const { t: getLabel } = useTranslation();

  const statusObj = useMemo(() => {
    switch (status) {
      case TRANSACTION.confirm:
        return { style: styles.confirmed, label: STRINGS.confirmed };
      case TRANSACTION.failed:
        return { style: styles.failed, label: STRINGS.failed };
      case TRANSACTION.pending:
        return { style: styles.pending, label: STRINGS.pending };
      default:
        return { style: {}, label: '' };
    }
  }, [status]);

  return (
    <Text style={[styles.transactionStatus, statusObj.style]}>
      {getLabel(statusObj.label)}
    </Text>
  );
};

TransactionStatus.propTypes = {
  status: PropTypes.oneOf(Object.values(TRANSACTION)),
};

export default TransactionStatus;

const styles = StyleSheet.create({
  transactionStatus: {
    ...FONTS.t12r,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confirmed: {
    backgroundColor: COLOR.system_green_background,
    color: COLOR.systemGreenLight1,
  },
  failed: {
    backgroundColor: COLOR.system_red_background,
    color: COLOR.systemRedLight,
  },
  pending: {
    backgroundColor: COLOR.system_yellow_background,
    color: COLOR.systemYellowLight1,
  },
});
