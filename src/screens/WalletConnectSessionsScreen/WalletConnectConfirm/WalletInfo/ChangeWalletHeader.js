import React from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONTS, ICONS, STRINGS } from '../../../../constants';
import { useTranslation } from 'react-i18next';

const ChangeWalletHeader = ({ sheetRef, onCloseModal }) => {
  const { t: getLabel } = useTranslation();

  const handleCloseModal = () => {
    onCloseModal && onCloseModal();
    sheetRef.current.snapTo(1);
  };

  return (
    <View style={styles.root}>
      <Text style={{ color: COLOR.white, ...FONTS.t16b }}>
        {getLabel(STRINGS.change_wallet)}
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleCloseModal}>
        <Image source={ICONS.clear2} />
      </TouchableOpacity>
    </View>
  );
};

ChangeWalletHeader.propTypes = {
  sheetRef: PropTypes.object,
  onCloseModal: PropTypes.func,
};

export default ChangeWalletHeader;

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLOR.simpleBackground,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
    position: 'relative',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLOR.gray5,
  },
  button: {
    position: 'absolute',
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    marginRight: 20,
  },
});
