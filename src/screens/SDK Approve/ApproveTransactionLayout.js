import React from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  HeaderLabel,
  RejectAndConfirmButton,
  RowSpaceBetweenItem,
  TransactionFeeIcon,
  WarningAlert,
} from 'components/common';
import { STRINGS, COLOR, FONTS } from 'constants';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import { StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from 'utils/format.util';

const ApproveTransactionLayout = ({
  headerLabel,
  title,
  subTitle,
  contractAddress,
  from,
  chain,
  transactionFeeValueFinally,
  coinSymbol,
  priceCoin,
  fiatCurrency,
  inSufficientBalance,
  maxTotalInUsd,
  onConfirm,
  onReject,
}) => {
  const { t: getLabel } = useTranslation();

  return (
    <Container>
      <HeaderLabel
        label={headerLabel || getLabel(STRINGS.smartContractCall)}
        hiddenBackButton
      />
      <ScrollView style={{ flex: 1, width: '100%' }}>
        <Text style={styles.name}>
          {title || getLabel(STRINGS.smartContractCall)}
        </Text>

        <Text style={styles.subTitle}>
          {subTitle || getLabel(STRINGS.approveTransaction)}
        </Text>

        <RowSpaceBetweenItem
          label={getLabel(STRINGS.from)}
          value={from}
          style={{ marginTop: 24 }}
        />

        <RowSpaceBetweenItem
          label={getLabel(STRINGS.contract_address)}
          value={contractAddress}
          style={{ marginTop: 12 }}
        />

        <RowItem
          label={getLabel(STRINGS.transactionFee)}
          icon={<TransactionFeeIcon chainName={chain.toUpperCase()} />}
          style={{ marginTop: 48 }}
          value={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  color: COLOR.white,
                  ...FONTS.t16r,
                }}>
                {`${transactionFeeValueFinally} ${coinSymbol}`}
              </Text>
              <Text style={styles.priceUsd}>
                {`(${formatCurrency(
                  transactionFeeValueFinally * priceCoin,
                  fiatCurrency,
                  5,
                )})`}
              </Text>
            </View>
          }
        />

        <RowItem
          label={getLabel(STRINGS.maxTotal)}
          labelStyle={FONTS.t16r}
          valueStyle={{
            color: inSufficientBalance ? COLOR.systemRedLight : COLOR.white,
          }}
          style={{ marginTop: 12 }}
          value={maxTotalInUsd}
        />
        {inSufficientBalance && (
          <Text style={styles.errorMsg}>
            {getLabel(STRINGS.your_balance_is_insufficient)}
          </Text>
        )}
      </ScrollView>

      <WarningAlert
        message={getLabel(STRINGS.accessFundRequest)}
        style={{ marginTop: 24 }}
      />
      <RejectAndConfirmButton
        style={{ marginTop: 24 }}
        onConfirm={onConfirm}
        onReject={onReject}
        isDisableConfirmButton={inSufficientBalance}
      />
    </Container>
  );
};

const RowItem = ({
  label,
  value,
  style,
  labelStyle,
  valueStyle,
  icon,
  ...otherProps
}) => {
  return (
    <View style={[styles.item, style]} {...otherProps}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {icon}
      </View>
      <Text style={[styles.value, valueStyle]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

ApproveTransactionLayout.propTypes = {
  headerLabel: PropTypes.string,
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string,
  onConfirm: PropTypes.func,
  onReject: PropTypes.func,
  contractAddress: PropTypes.string,
  from: PropTypes.string,
};

const styles = StyleSheet.create({
  name: {
    color: COLOR.white,
    ...FONTS.t30b,
    marginTop: 32,
    textAlign: 'center',
  },
  subTitle: {
    ...FONTS.t16r,
    color: COLOR.white,
    marginTop: 26,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: COLOR.textSecondary,
    ...FONTS.t14r,
  },
  value: {
    color: COLOR.white,
    ...FONTS.t16r,
  },
  priceUsd: {
    paddingLeft: 4,
    color: COLOR.textSecondary,
    ...FONTS.t12r,
  },
});

export default ApproveTransactionLayout;
