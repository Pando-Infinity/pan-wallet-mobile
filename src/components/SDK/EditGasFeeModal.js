import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { SliderGasFee } from 'components/common';
import { formatCurrency } from 'utils/format.util';
import { useSelector } from 'react-redux';
import { COLOR, STRINGS } from 'constants';
import CustomButton from 'components/CustomButton/CustomButton';
import { useTranslation } from 'react-i18next';
import {
  getChainInfoByType,
  getGasOptionByNetwork,
  getGasStatusLabel,
  getTransactionFeeByType,
} from 'utils/gas.util';
import { getCoinInfoOnMarket } from 'utils/infoToken';

const EditGasFeeModal = ({
  selectedIndexGasFee,
  onSave,
  contractSymbol,
  defaultGasFee,
  gasPrice,
}) => {
  const { t: getLabel } = useTranslation();
  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  const [values, setValues] = useState(selectedIndexGasFee);
  const [gasFee, setGasFee] = useState(0);
  const [priceCoin, setPriceCoin] = useState(0);

  const gasOptions = useMemo(
    () => getGasOptionByNetwork(contractSymbol),
    [contractSymbol],
  );

  const chainInfo = useMemo(
    () => getChainInfoByType(contractSymbol),
    [contractSymbol],
  );

  const gasFeeByDecimals = useMemo(() => {
    return parseFloat((gasFee / 10 ** chainInfo.decimals).toFixed(5));
  }, [gasFee, chainInfo.decimals]);

  const handleChangeGasFee = newValue => {
    setValues(newValue[0]);
  };

  useEffect(() => {
    getTransactionFeeByType(
      contractSymbol,
      gasOptions?.[values],
      defaultGasFee,
      gasPrice,
    ).then(data => {
      setGasFee(data.transactionFee);
    });
  }, [contractSymbol, gasOptions, values, chainInfo.decimals]);

  useEffect(() => {
    getCoinInfoOnMarket(chainInfo.symbol, fiatCurrency).then(info => {
      setPriceCoin(info?.[0]?.current_price || 0);
    });
  }, [chainInfo.symbol, fiatCurrency]);

  return (
    <View style={styles.root}>
      <SliderGasFee
        label={getGasStatusLabel(getLabel, gasOptions?.[values]?.stt)}
        gasFee={`${gasFeeByDecimals} ${chainInfo.symbol}`}
        gasFeeUsd={formatCurrency(
          gasFeeByDecimals * priceCoin,
          fiatCurrency,
          5,
        )}
        values={[values]}
        max={gasOptions?.length - 1}
        onValuesChange={handleChangeGasFee}
        style={styles.slider}
      />
      <CustomButton
        label={getLabel(STRINGS.save)}
        width={163}
        height={48}
        onPress={() => {
          onSave(values);
        }}
        style={styles.button}
      />
    </View>
  );
};

EditGasFeeModal.propTypes = {
  selectedIndexGasFee: PropTypes.number,
  onSave: PropTypes.func,
  contractSymbol: PropTypes.string,
};

export default EditGasFeeModal;

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLOR.simpleBackground,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 300,
    paddingBottom: 100,
  },
  slider: {
    marginTop: 36,
  },
  button: {
    marginTop: 52,
  },
});
