import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SIZES, COLOR, FONTS, ICONS, STRINGS } from 'constants';
import { SliderGasFee } from 'components/common';
import { useTranslation } from 'react-i18next';
import { TransactionFeeModal } from 'components/modals';

const TransactionFee = ({
  values,
  max,
  gasStatusLabel,
  gasFee,
  gasFeeUsd,
  onValuesChange,
  isHiddenSlider,
  networkSymbol,
  ...otherProps
}) => {
  const { t } = useTranslation();
  const [isVisibleModal, setIsVisibleModal] = useState(false);

  return (
    <View {...otherProps}>
      <View style={styles.infoWrapper}>
        <Text style={{ color: COLOR.textSecondary, ...FONTS.t14r }}>
          {t(STRINGS.transaction_fee)}
        </Text>
        <TouchableOpacity
          style={{
            width: SIZES.iconSize,
            height: SIZES.iconSize,
          }}
          onPress={() => setIsVisibleModal(true)}>
          <Image source={ICONS.info} resizeMode="cover" />
        </TouchableOpacity>
      </View>

      <SliderGasFee
        label={gasStatusLabel}
        gasFee={gasFee}
        gasFeeUsd={gasFeeUsd}
        values={values}
        max={max}
        onValuesChange={onValuesChange}
        style={styles.slider}
        isHiddenSlider={isHiddenSlider}
      />

      <TransactionFeeModal
        chainName={networkSymbol}
        isVisible={isVisibleModal}
        onClose={() => setIsVisibleModal(false)}
      />
    </View>
  );
};

TransactionFee.propTypes = {
  onValuesChange: PropTypes.func,
  values: PropTypes.array,
  max: PropTypes.number,
  gasStatusLabel: PropTypes.string,
  gasFee: PropTypes.string,
  gasFeeUsd: PropTypes.string,
  isHiddenSlider: PropTypes.bool,
  networkSymbol: PropTypes.string,
};

TransactionFee.defaultProps = {};

const styles = StyleSheet.create({
  slider: {
    width: SIZES.width - 32,
    alignSelf: 'center',
    alignItems: 'center',
  },
  infoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
});

export default TransactionFee;
