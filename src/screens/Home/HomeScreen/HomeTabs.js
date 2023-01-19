import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR } from 'constants';

const HomeTabs = ({ selectedTab, onChangeTab, style, ...otherProps }) => {
  return (
    <View style={[styles.wrapper, style]} {...otherProps}>
      {HOME_TABS.map(({ label, value }, index) => {
        const isActive = selectedTab === value;

        return (
          <TouchableOpacity
            key={index}
            style={[styles.item, isActive && styles.selected]}
            onPress={() => onChangeTab(value)}>
            <Text style={[styles.label, isActive && styles.labelSelected]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const HOME_TAB_VALUES = {
  tokens: 1,
  nfts: 2,
};

const HOME_TABS = [
  { label: 'Tokens', value: HOME_TAB_VALUES.tokens },
  {
    label: 'NFTs',
    value: HOME_TAB_VALUES.nfts,
  },
];

HomeTabs.propTypes = {
  selectedTab: PropTypes.oneOf(Object.values(HOME_TAB_VALUES)).isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onChangeTab: PropTypes.func,
};

HomeTabs.defaultProps = {};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    borderBottomColor: COLOR.gray5,
    borderBottomWidth: 1,
  },
  item: {
    flex: 1,
  },
  selected: {
    borderBottomWidth: 3,
    borderBottomColor: COLOR.shade6,
  },
  labelSelected: {
    color: COLOR.white,
  },
  label: {
    color: COLOR.gray7,
    paddingVertical: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default memo(HomeTabs);
