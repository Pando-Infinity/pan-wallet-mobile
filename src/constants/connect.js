import { Platform } from 'react-native';

export default {
  response: {
    connect: Platform.OS === 'ios' ? 'panconnect/connect?' : '/pan/connect?',
    transfer: Platform.OS === 'ios' ? 'panconnect/transfer?' : '/pan/transfer?',
    response: Platform.OS === 'ios' ? 'panconnect/response?' : '/pan/response?',
    approve: Platform.OS === 'ios' ? 'panconnect/approve?' : '/pan/approve?',
    buyNFT: Platform.OS === 'ios' ? 'panconnect/buy_nft?' : '/pan/buy_nft?',
    sellNFT: Platform.OS === 'ios' ? 'panconnect/sell_nft?' : '/pan/sell_nft?',
    sendNFT: Platform.OS === 'ios' ? 'panconnect/send_nft?' : '/pan/send_nft?',
    depositToken:
      Platform.OS === 'ios'
        ? 'panconnect/deposit_token?'
        : '/pan/deposit_token?',
    withdrawToken:
      Platform.OS === 'ios'
        ? 'panconnect/withdraw_token?'
        : '/pan/withdraw_token?',
    buyBox: Platform.OS === 'ios' ? 'panconnect/buy_box?' : '/pan/buy_box?',
    unlockBox:
      Platform.OS === 'ios' ? 'panconnect/unlock_box?' : '/pan/unlock_box?',
    openBox: Platform.OS === 'ios' ? 'panconnect/open_box?' : '/pan/open_box?',
    sendBox: Platform.OS === 'ios' ? 'panconnect/send_box?' : '/pan/send_box?',
    stakeNFT:
      Platform.OS === 'ios' ? 'panconnect/stake_nft?' : '/pan/stake_nft?',
    unStakeNFT:
      Platform.OS === 'ios' ? 'panconnect/unstake_nft?' : '/pan/unstake_nft?',
    cancelTransaction:
      Platform.OS === 'ios'
        ? 'panconnect/cancel_transaction?'
        : '/pan/cancel_transaction?',
    cancelTransactionNonSuccess:
      Platform.OS === 'ios'
        ? 'panconnect/cancel_transaction_non_success?'
        : '/pan/cancel_transaction_non_success?',
  },

  params: {
    name: 'name',
    scheme: 'scheme',
    logo: 'logo',
    chain: 'chain',
    endpoint: 'endpoint',
    url: 'url',
    accessToken: 'pan_access_token',
    bundle: 'bundle',
    contractToken: 'contract_token',
    receiptAddress: 'address_receipt',
    amount: 'amount',
    tokenSymbol: 'token_symbol',
    contractAddress: 'contract_address',
    nft: 'nft',
    transactionData: 'transaction_data',
    addressReceive: 'address_receive',
    type: 'type',
    nameBox: 'name_box',
    toAddress: 'to_address',
    addressSpender: 'address_spender',
    addressOperator: 'address_operator',
  },

  path: {
    connect: '/connect',
    transfer: '/transfer',
    response: '/response',
    approve: '/approve',
    sendNFT: '/send_nft',
    buyNFT: '/buy_nft',
    sellNFT: '/sell_nft',
    depositToken: '/deposit_token',
    withdrawToken: '/withdraw_token',
    buyBox: '/buy_box',
    unlockBox: '/unlock_box',
    openBox: '/open_box',
    sendBox: '/send_box',
    stakeNFT: '/stake_nft',
    unStakeNFT: '/unstake_nft',
    cancelTransaction: '/cancel_transaction',
    cancelTransactionNonSuccess: '/cancel_transaction_non_success',
  },

  pan_response: {
    with_draw_wrong: {
      code: 422,
      message: 'Withdraw token wrong',
    },
    deposit_token_wrong: {
      code: 421,
      message: 'Deposit token wrong',
    },
    transfer_token_wrong: {
      code: 420,
      message: 'Transfer token wrong',
    },
    error: {
      code: 419,
      message: 'Error',
    },

    no_action_cancel: {
      code: 418,
      message: 'No action matches the request',
    },

    handled_in_blockchain: {
      code: 417,
      message: 'Not cancel transaction when transaction sent to blockchain',
    },

    not_connect: {
      code: 416,
      message: 'Not connect to current wallet',
    },

    not_approve: {
      code: 415,
      message: 'Not Approve',
    },

    not_support_block_chain: {
      code: 414,
      message: 'PanWallet not support network blockchain',
    },

    wrong_format: {
      code: 411,
      message: 'Wrong format',
    },

    not_support_btc: {
      code: 410,
      message: 'Not support btc',
    },

    solana_without_approval: {
      code: 410,
      message: 'Solana network without approval',
    },

    token_not_support: {
      code: 409,
      message: 'Token not support in pan wallet',
    },

    user_wallet_not_sp: {
      code: 407,
      message: 'User wallet not have account with dapp chain',
    },

    session_did_handle: {
      code: 406,
      message: 'Please handle session before send new request',
    },

    login_width_other_chain: {
      code: 405,
      message:
        'Your dapp has been connected with other chain. Please disconnect and try again',
    },

    no_account_support: {
      code: 404,
      message:
        'Dont have any account support for dapp, please create and connect again',
    },

    user_reject_deposit: {
      code: 402,
      message: 'User reject Deposit',
    },

    user_reject_transfer: {
      code: 402,
      message: 'User reject Transfer Token',
    },

    user_reject_withdraw: {
      code: 402,
      message: 'User reject With Draw Token',
    },

    user_reject: {
      code: 402,
      message: 'User reject connection',
    },

    user_reject_send_nft: {
      code: 402,
      message: 'User reject send nft request',
    },

    user_reject_sell_nft: {
      code: 402,
      message: 'User reject sell nft request',
    },

    user_reject_buy_nft: {
      code: 402,
      message: 'User reject buy nft request',
    },

    user_reject_stake_nft: {
      code: 402,
      message: 'User reject stake nft to game request',
    },

    user_reject_approve: {
      code: 402,
      message: 'User reject approve request',
    },

    user_reject_open_box: {
      code: 402,
      message: 'User reject open box request',
    },

    user_reject_unlock_box: {
      code: 402,
      message: 'User reject unlock box request',
    },

    user_reject_send_box: {
      code: 402,
      message: 'User reject send box request',
    },

    user_reject_buy_box: {
      code: 402,
      message: 'User reject buy box request',
    },

    user_reject_un_stake_nft: {
      code: 402,
      message: 'User reject unstake nft request',
    },

    user_reject_cancel_transaction: {
      code: 402,
      message: 'User reject cancel transaction',
    },

    send_box_wrong: {
      code: 400,
      message: 'Send box failed',
    },

    buy_box_wrong: {
      code: 400,
      message: 'Buy box failed',
    },

    unlock_box_wrong: {
      code: 400,
      message: 'Unlock box failed',
    },

    open_box_wrong: {
      code: 400,
      message: 'Open box failed',
    },

    send_nft_wrong: {
      code: 400,
      message: 'Send nft request failed',
    },

    buy_nft_wrong: {
      code: 400,
      message: 'Buy nft request failed',
    },

    sell_nft_wrong: {
      code: 400,
      message: 'Sell nft request failed',
    },

    stake_nft_wrong: {
      code: 400,
      message: 'Stake nft to game request failed',
    },

    unstake_nft_wrong: {
      code: 400,
      message: 'Unstake nft to wallet request failed',
    },

    approve_wrong: {
      code: 400,
      message: 'Approve failed',
    },

    input_invalid: {
      code: 400,
      message: 'Input invalid',
    },

    cancel_transaction_wrong: {
      code: 400,
      message: 'Cancel transaction request failed',
    },

    is_approved: {
      code: 201,
      message: 'Is Approved',
    },

    success: {
      code: 200,
      message: 'Ok',
    },
  },

  screen_name: {
    connect: 'Connect',
    transfer: 'Transfer',
  },
};
