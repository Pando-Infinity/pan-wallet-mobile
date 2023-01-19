export const signAndSendSignedTransaction = async (
  provider,
  transactionObj,
  privateKey,
) => {
  return await provider.eth.accounts.signTransaction(
    transactionObj,
    privateKey,
    (err, signedTx) => {
      if (err) {
        throw err;
      }
      provider.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        (error, txHash) => {
          if (error) {
            throw error;
          } else {
            return txHash;
          }
        },
      );
    },
  );
};
