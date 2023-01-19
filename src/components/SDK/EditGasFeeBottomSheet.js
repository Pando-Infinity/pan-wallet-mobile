import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import BottomSheet from 'reanimated-bottom-sheet';
import EditGasFeeModal from './EditGasFeeModal';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ICONS, COLOR, FONTS, STRINGS } from 'constants';
import { useTranslation } from 'react-i18next';
import { Backdrop } from 'components/common';

const EditGasFeeBottomSheet = forwardRef(
  (
    {
      onSave,
      onClose,
      selectedIndexGasFee,
      contractSymbol,
      isEditableGasFee,
      defaultGasFee,
      gasPrice,
    },
    ref,
  ) => {
    return (
      <>
        <Backdrop open={isEditableGasFee} />
        <BottomSheet
          ref={ref}
          snapPoints={[338, 0]}
          initialSnap={1}
          enabledContentTapInteraction={false}
          enabledGestureInteraction={false}
          renderHeader={() => <Header onClose={onClose} />}
          renderContent={() =>
            isEditableGasFee && (
              <EditGasFeeModal
                contractSymbol={contractSymbol}
                selectedIndexGasFee={selectedIndexGasFee}
                onSave={onSave}
                defaultGasFee={defaultGasFee}
                gasPrice={gasPrice}
              />
            )
          }
        />
      </>
    );
  },
);

EditGasFeeBottomSheet.displayName = 'EditGasFeeBottomSheet';

const Header = ({ onClose }) => {
  const { t: getLabel } = useTranslation();

  return (
    <View style={styles.gasFeeHeader}>
      <Text style={{ color: COLOR.white, ...FONTS.t16b }}>
        {getLabel(STRINGS.editGasFee)}
      </Text>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Image source={ICONS.clear2} />
      </TouchableOpacity>
    </View>
  );
};

Header.propTypes = {
  onClose: PropTypes.func,
};

EditGasFeeBottomSheet.propTypes = {
  onSave: PropTypes.func,
  selectedIndexGasFee: PropTypes.number,
  contractSymbol: PropTypes.string,
  ref: PropTypes.any,
  isEditableGasFee: PropTypes.bool,
  onClose: PropTypes.func,
};

const styles = StyleSheet.create({
  gasFeeHeader: {
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
  closeButton: {
    position: 'absolute',
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    marginRight: 20,
  },
});

export default EditGasFeeBottomSheet;
