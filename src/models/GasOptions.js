export const GAS_STATUS = {
  verySlow: 'Very Slow',
  slow: 'Slow',
  medium: 'Medium',
  fast: 'Fast',
  superFast: 'Super Fast',
  gasWar: 'Gas War',
  starWar: 'Star War',
};

export const GasOptions = {
  btc: [
    {
      tip: 4000,
      stt: GAS_STATUS.slow,
    },
    {
      tip: 6000,
      stt: GAS_STATUS.medium,
    },
    {
      tip: 8000,
      stt: GAS_STATUS.fast,
    },
  ],
  bsc: [
    {
      tip: 0,
      stt: GAS_STATUS.medium,
    },
    {
      tip: 0.5,
      stt: GAS_STATUS.fast,
    },
    {
      tip: 1.5,
      stt: GAS_STATUS.superFast,
    },
    {
      tip: 3.5,
      stt: GAS_STATUS.gasWar,
    },
    {
      tip: 10,
      stt: GAS_STATUS.starWar,
    },
  ],
  eth: [
    {
      tip: 0.1,
      stt: GAS_STATUS.verySlow,
    },
    {
      tip: 1,
      stt: GAS_STATUS.slow,
    },
    {
      tip: 5,
      stt: GAS_STATUS.medium,
    },
    {
      tip: 10,
      stt: GAS_STATUS.fast,
    },
    {
      tip: 20,
      stt: GAS_STATUS.superFast,
    },
    {
      tip: 50,
      stt: GAS_STATUS.gasWar,
    },
    {
      tip: 100,
      stt: GAS_STATUS.starWar,
    },
  ],
  sol: [
    {
      tip: 5000,
      stt: GAS_STATUS.medium,
    },
  ],
};
