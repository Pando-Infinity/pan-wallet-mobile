import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR, FONTS, STRINGS } from 'constants';
import { useTranslation } from 'react-i18next';

const TotalPrice = ({ isInvalid, price, ...otherProps }) => {
  const styles = createStyles({ isInvalid });
  const { t } = useTranslation();

  return (
    <View {...otherProps}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.label}>{t(STRINGS.total)}</Text>
        <Text style={styles.price}>{price ?? 0}</Text>
      </View>

      {isInvalid && (
        <Text style={styles.errorMsg}>{t(STRINGS.insufficient_balance)}</Text>
      )}
    </View>
  );
};

TotalPrice.propTypes = {
  isInvalid: PropTypes.bool,
  price: PropTypes.number,
};

TotalPrice.defaultProps = {};

const createStyles = ({ isInvalid }) =>
  StyleSheet.create({
    label: {
      color: COLOR.textSecondary,
      ...FONTS.t16r,
      flex: 1,
    },
    price: {
      color: isInvalid ? COLOR.systemRedLight : COLOR.white,
      ...FONTS.t20b,
    },
    errorMsg: {
      alignSelf: 'flex-end',
      color: COLOR.systemRedLight,
      ...FONTS.t12r,
      marginTop: 4,
    },
  });

export default TotalPrice;
