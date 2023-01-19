import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FONTS, COLOR, SIZES, ICONS } from 'constants';

const CustomTextInput = ({
  label,
  style,
  error,
  value,
  onChangeText,
  wrapperProps,
  labelProps,
  linearProps,
  onBlur,
  onFocus,
  icons,
  ...otherProps
}) => {
  const { style: wrapperStyle, ...otherWrapperProps } = wrapperProps;
  const { style: labelStyle, ...otherLabelProps } = labelProps;
  const { style: linearStyle, ...otherLinearProps } = linearProps;

  const inputRef = useRef();

  const [isFocused, setIsFocused] = useState(false);

  const isErrorOrFocused = useMemo(
    () => isFocused || error,
    [isFocused, error],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur();
  }, [onBlur]);

  const handleClearData = useCallback(() => {
    onChangeText('');
  }, [onChangeText]);

  return (
    <LinearGradient
      colors={
        error ? [COLOR.systemRedLight, COLOR.systemRedLight] : COLOR.gradient3
      }
      style={[
        isErrorOrFocused
          ? {
              borderRadius: SIZES.radius,
              padding: 1,
            }
          : { borderRadius: SIZES.radius + 5 },
        linearStyle,
      ]}
      {...otherLinearProps}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          inputRef.current?.focus();
          setIsFocused(true);
        }}
        style={[styles.wrapper(isFocused), wrapperStyle]}
        {...otherWrapperProps}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.label(isErrorOrFocused), labelStyle]}
              {...otherLabelProps}>
              {label}
            </Text>

            {isFocused || value?.length ? (
              <TextInput
                autoFocus={isFocused}
                ref={inputRef}
                value={value}
                placeholderTextColor={COLOR.gray8}
                style={[styles.input, style]}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onChangeText={onChangeText}
                {...otherProps}
              />
            ) : (
              <></>
            )}
          </View>

          {isFocused && value?.length ? (
            <ClearIconButton onPress={handleClearData} />
          ) : (
            <></>
          )}
          {icons}
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const ClearIconButton = ({ style, ...otherProps }) => {
  return (
    <TouchableOpacity style={styles.clearButton} {...otherProps}>
      <Image source={ICONS.clear} />
    </TouchableOpacity>
  );
};

export default memo(CustomTextInput);

ClearIconButton.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

CustomTextInput.propTypes = {
  wrapperProps: PropTypes.shape({
    style: PropTypes.object,
  }),
  labelProps: PropTypes.shape({
    style: PropTypes.object,
  }),
  linearProps: PropTypes.shape({
    style: PropTypes.object,
  }),
  onChangeText: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  error: PropTypes.bool,
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  icons: PropTypes.node,
};

CustomTextInput.defaultProps = {
  wrapperProps: { style: {} },
  labelProps: { style: {} },
  linearProps: { style: {} },
  onChangeText: () => {},
  onBlur: () => {},
  onFocus: () => {},
};

const styles = StyleSheet.create({
  wrapper: isFocused => ({
    justifyContent: 'center',
    paddingVertical: SIZES.simpleSpace,
    paddingHorizontal: SIZES.simpleMargin,
    paddingRight: isFocused ? SIZES.simpleSpace / 2 : SIZES.simpleSpace,
    borderRadius: SIZES.radius,
    minHeight: SIZES.simpleHeightTextField,
    backgroundColor: isFocused ? COLOR.gray4 : COLOR.gray3,
    borderColor: COLOR.gray3,
    borderWidth: 1,
  }),
  label: isFocused => ({
    color: isFocused ? COLOR.textSecondary : COLOR.white,
    ...FONTS[isFocused ? 't12b' : 't14b'],
  }),
  input: {
    color: COLOR.white,
    ...FONTS.t14r,
    padding: 0,
    marginTop: SIZES.simpleSpace / 2,
  },
  clearButton: {
    width: SIZES.iconWidth,
    height: SIZES.iconHeight,
  },
});
