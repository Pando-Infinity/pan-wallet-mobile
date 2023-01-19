import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from 'components/CustomButton/CustomButton';
import { useTranslation } from 'react-i18next';
import { COLOR } from 'constants';
import { FONTS } from 'constants';
import { STRINGS } from 'constants';

const RejectAndConfirmButton = ({
  onReject,
  onConfirm,
  style,
  isDisableConfirmButton,
  confirmLabel,
}) => {
  const { t: getLabel } = useTranslation();

  return (
    <View style={[styles.root, style]}>
      <TouchableOpacity
        style={{
          width: 163,
          height: 48,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onReject}>
        <Text style={{ color: COLOR.white, ...FONTS.t16b }}>
          {getLabel(STRINGS.reject_btn)}
        </Text>
      </TouchableOpacity>

      <CustomButton
        isDisable={isDisableConfirmButton}
        label={confirmLabel ?? getLabel(STRINGS.confirm)}
        width={163}
        height={48}
        onPress={onConfirm}
      />
    </View>
  );
};

RejectAndConfirmButton.propTypes = {
  onReject: PropTypes.func,
  onConfirm: PropTypes.func,
  style: PropTypes.object,
  isDisableConfirmButton: PropTypes.bool,
  confirmLabel: PropTypes.string,
};

export default RejectAndConfirmButton;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
});
