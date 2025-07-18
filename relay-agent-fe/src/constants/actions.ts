import {
  IAction,
  ACTION_TYPES,
  COMPONENTS,
  INPUT_TYPES,
  IPromptConfig,
  IPromptOption,
} from '@/interfaces/actions.interface';
import { zeroAddress } from 'viem';
import { CHAIN_ID } from '.';

export const BASE_TOKENS = [
  {
    label: 'ETH',
    value: 'ETH',
    address: zeroAddress,
    icon: '/icons/tokens/eth.svg',
  },
  {
    label: 'USDC',
    value: 'USDC',
    isStablecoin: true,
    address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    icon: '/icons/tokens/usdce.png',
  },
  {
    label: 'Virtual',
    value: 'VIRTUAL',
    address: '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b',
    pair: '0xE31c372a7Af875b3B5E0F3713B17ef51556da667',
    icon: '/icons/tokens/virtual.png',
  },
  {
    label: 'AIXBT',
    value: 'AIXBT',
    address: '0x4f9fd6be4a90f2620860d680c0d4d5fb53d1a825',
    pair: '0xf1Fdc83c3A336bdbDC9fB06e318B08EadDC82FF4',
    icon: '/icons/tokens/aixbt.png',
  },
  {
    label: 'VADER',
    value: 'VADER',
    address: '0x731814e491571a2e9ee3c5b1f7f3b962ee8f4870',
    pair: '0xA1ddDB82501E8fe2d92Ad0E8Ba331313f501de72',
    icon: '/icons/tokens/vader.png',
  },
  {
    label: 'GAME',
    value: 'GAME',
    address: '0x1c4cca7c5db003824208adda61bd749e55f463a3',
    pair: '0xD418dfE7670c21F682E041F34250c114DB5D7789',
    icon: '/icons/tokens/game.png',
  },
  {
    label: 'LUNA',
    value: 'LUNA',
    address: '0x55cd6469f597452b5a7536e2cd98fde4c1247ee4',
    pair: '0xa8e64FB120CE8796594670BAE72279C8aA1e5359',
    icon: '/icons/tokens/luna.png',
  },
  {
    label: 'TIBBIR',
    value: 'TIBBIR',
    address: '0xa4a2e2ca3fbfe21aed83471d28b6f65a233c6e00',
    pair: '0x0c3b466104545efa096b8f944c1e524E1d0D4888',
    icon: '/icons/tokens/tibbir.png',
  },
  {
    label: 'ACOLYT',
    value: 'ACOLYT',
    address: '0x79dacb99a8698052a9898e81fdf883c29efb93cb',
    pair: '0xfb2be279dCAFE6b5364e4C49A0A39aedf9c38ac7',
    icon: '/icons/tokens/acolyt.png',
  },
];

export const BERACHAIN_TOKENS = [
  {
    label: 'BERA',
    value: 'BERA',
    address: zeroAddress,
    icon: '/icons/tokens/bera.png',
  },
  {
    label: 'HENLO',
    value: 'HENLO',
    address: '0xb2F776e9c1C926C4b2e54182Fac058dA9Af0B6A5',
    pair: '0xcb42b9d09d8da230d0390728c6f236511fac403b',
    icon: '/icons/tokens/henlo.png',
  },
  {
    label: 'HONEY',
    value: 'HONEY',
    address: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce',
    isStablecoin: true,
    icon: '/icons/tokens/honey.png',
  },
  {
    label: 'USDe',
    value: 'USDe',
    address: '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34',
    isStablecoin: true,
    icon: '/icons/tokens/usde.png',
  },
  {
    label: 'BYUSD',
    value: 'BYUSD',
    address: '0x688e72142674041f8f6Af4c808a4045cA1D6aC82',
    isStablecoin: true,
    icon: '/icons/tokens/byusd.png',
  },
  {
    label: 'NECT',
    value: 'NECT',
    address: '0x1cE0a25D13CE4d52071aE7e02Cf1F6606F4C79d3',
    isStablecoin: true,
    icon: '/icons/tokens/nectar.png',
  },
  {
    label: 'iBGT',
    value: 'iBGT',
    address: '0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b',
    pair: '0x12bf773f18cec56f14e7cb91d82984ef5a3148ee',
    icon: '/icons/tokens/ibgt.png',
  },
  {
    label: 'rUSD',
    value: 'rUSD',
    address: '0x09D4214C03D01F49544C0448DBE3A27f768F2b34',
    isStablecoin: true,
    icon: '/icons/tokens/rusd.png',
  },
  {
    label: 'WBTC',
    value: 'WBTC',
    address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    icon: '/icons/tokens/wbtc.png',
  },
  {
    label: 'weETH',
    value: 'weETH',
    address: '0x7DCC39B4d1C53CB31e1aBc0e358b43987FEF80f7',
    icon: '/icons/tokens/weeth.png',
  },
  {
    label: 'OHM',
    value: 'OHM',
    address: '0x18878Df23e2a36f81e820e4b47b4A40576D3159C',
    pair: '0x75159c541bd49b1b6c51f5f3e796579e7cccb071',
    icon: '/icons/tokens/ohm.png',
  },
  {
    label: 'WBERA',
    value: 'WBERA',
    address: '0x6969696969696969696969696969696969696969',
    icon: '/icons/tokens/wbera.png',
  },
  {
    label: 'LBTC',
    value: 'LBTC',
    address: '0xecAc9C5F704e954931349Da37F60E39f515c11c1',
    icon: '/icons/tokens/lbtc.png',
  },
  {
    label: 'USDT',
    value: 'USDT',
    address: '0x779Ded0c9e1022225f8E0630b35a9b54bE713736',
    isStablecoin: true,
    icon: '/icons/tokens/usdt.png',
  },
  {
    label: 'HOLD',
    value: 'HOLD',
    address: '0xFF0a636Dfc44Bb0129b631cDd38D21B613290c98',
    pair: '0xdca120bd3a13250b67f6faa5c29c1f38ec6ebece',
    icon: '/icons/tokens/hold.png',
  },
  {
    label: 'YEET',
    value: 'YEET',
    address: '0x08A38Caa631DE329FF2DAD1656CE789F31AF3142',
    pair: '0xf065f7ccf54ef8596fe77a4836d963d5af84eb5d',
    icon: '/icons/tokens/yeet.png',
  },
  {
    label: 'USDC.e',
    value: 'USDC.e',
    address: '0x549943e04f40284185054145c6E4e9568C1D3241',
    isStablecoin: true,
    icon: '/icons/tokens/usdce.png',
  },
  {
    label: 'LBGT',
    value: 'LBGT',
    address: '0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe',
    pair: '0x705fc16ba5a1eb67051934f2fb17eacae660f6c7',
    icon: '/icons/tokens/lbgt.png',
  },
  {
    label: 'BGT',
    value: 'BGT',
    address: '0x656b95E550C07a9ffe548bd4085c72418Ceb1dba',
    icon: '/icons/tokens/bgt.png',
  },
  {
    label: 'WETH',
    value: 'WETH',
    address: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
    icon: '/icons/tokens/weth.png',
  },
  {
    label: 'stBGT',
    value: 'stBGT',
    address: '0x2CeC7f1ac87F5345ced3D6c74BBB61bfAE231Ffb',
    pair: '0xa91576253fed7a4647c3c9638468c656d0fa6457',
    icon: '/icons/tokens/stbgt.png',
  },
  {
    label: 'BRLY',
    value: 'BRLY',
    address: '0xab7e0f3d69de8061aa46d7c9964dbc11878468eb',
    pair: '0x9BE2467a28DFa5f685275784A7Cb8FD55ba9e350',
    icon: '/icons/tokens/brly.png',
  },
  {
    label: 'PLUG',
    value: 'PLUG',
    address: '0x231a6bd8eb88cfa42776b7ac575cecaf82bf1e21',
    pair: '0xac1D44f0284634EB04FFA56C76d47e839224b46F',
    icon: '/icons/tokens/plug.png',
  },
  {
    label: 'RAMEN',
    value: 'RAMEN',
    address: '0xb8b1af593dc37b33a2c87c8db1c9051fc32858b7',
    pair: '0x059F4f9861E7Bb21Db660f418228d61633A586EE',
    icon: '/icons/tokens/ramen.png',
  },
  {
    label: 'BM',
    value: 'BM',
    address: '0xb749584f9fc418cf905d54f462fdbfdc7462011b',
    pair: '0xF4445F66F0e72B75E24407b1F78441bF7Fe15752',
    icon: '/icons/tokens/bm.png',
  },
  {
    label: 'iBERA',
    value: 'iBERA',
    address: '0x9b6761bf2397Bb5a6624a856cC84A3A14Dcd3fe5',
    icon: '/icons/tokens/ibera.svg',
  },
  {
    label: 'beraETH',
    value: 'beraETH',
    address: '0x6fc6545d5cDE268D5C7f1e476D444F39c995120d',
    icon: '/icons/tokens/beraeth.svg',
  },
  {
    label: 'USDbr',
    value: 'USDbr',
    address: '0x6d4223DAE2a8744a85a6d44e97f3F61679f87ee6',
    isStablecoin: true,
    icon: '/icons/tokens/usdbr.png',
  },
];

export const LP_TOKENS = [
  {
    label: 'BYUSD-HONEY',
    value: 'BYUSD-HONEY',
    address: '0xdE04c469Ad658163e2a5E860a03A86B52f6FA8C8',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
  },
  {
    label: 'USDC.e-HONEY',
    value: 'USDC.e-HONEY',
    address: '0xF961a8f6d8c69E7321e78d254ecAfBcc3A637621',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
  },
  {
    label: 'WBERA-HONEY',
    value: 'WBERA-HONEY',
    address: '0x2c4a603A2aA5596287A06886862dc29d56DbC354',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
  },
  {
    label: 'WETH-WBERA',
    value: 'WETH-WBERA',
    address: '0xDd70A5eF7d8CfE5C5134b5f9874b09Fb5Ce812b4',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
  },
  {
    label: 'WBTC-WBERA',
    value: 'WBTC-WBERA',
    address: '0x38fdD999Fe8783037dB1bBFE465759e312f2d809',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
  },
  {
    label: 'WBERA-iBERA',
    value: 'WBERA-iBERA',
    address: '0x62C030B29a6Fef1B32677499e4a1F1852a8808c0',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
  },
  {
    label: 'WETH-beraETH',
    value: 'WETH-beraETH',
    address: '0x258d8933B625566fBe057874121783a2808aDafA',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
  },
  {
    label: 'WBERA-LBGT',
    value: 'WBERA-LBGT',
    address: '0x705Fc16BA5A1EB67051934F2Fb17EacaE660F6c7',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
  },
  {
    label: 'USDbr-HONEY',
    value: 'USDbr-HONEY',
    address: '0xB1F0c3a875512191Eb718b305f192dc19564F513',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
  },
  {
    label: 'rUSD-HONEY',
    value: 'rUSD-HONEY',
    address: '0x7fd165B73775884a38AA8f2B384A53A3Ca7400E6',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
    isLPV3: true,
    dexPriceSource: null,
  },
  {
    label: 'WETH-beraETH',
    value: 'WETH-beraETH',
    address: '0x03bCcF796cDef61064c4a2EffdD21f1AC8C29E92',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
    isLPV3: true,
  },
  {
    label: 'OHM-HONEY',
    value: 'OHM-HONEY',
    address: '0x98bDEEde9A45C28d229285d9d6e9139e9F505391',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
    isLPV3: true,
    dexPriceSource: null,
  },
  {
    label: 'WBERA-LBGT',
    value: 'WBERA-LBGT',
    address: '0x337eF1eB6c8BBeD571170Fc2b468608ab9e2Aac8',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
    isLPV3: true,
  },
  {
    label: 'WBERA-iBERA',
    value: 'WBERA-iBERA',
    address: '0xE3EeB9e48934634d8B5B39A0d15DD89eE0F969C4',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
    isLPV3: true,
  },
  {
    label: 'USDbr-HONEY',
    value: 'USDbr-HONEY',
    address: '0x28a54EaeEc63fBb1175d13466a9ada5f3175D577',
    icon: '/icons/tokens/default.svg',
    isLPToken: true,
    isLPV3: true,
  },
];

export const BERACHAIN_ACTIONS: IAction[] = [
  {
    label: 'Check portfolio',
    icon: '/icons/actions/portfolio.svg',
    whiteIcon: '/icons/actions/portfolio-white.svg',
    description: 'Check my portfolio balance',
    actionPrompt: 'Check my portfolio balance',
    actionType: ACTION_TYPES.CHECK_PORTFOLIO,
  },
  {
    label: 'Check wallet',
    icon: '/icons/actions/check.svg',
    whiteIcon: '/icons/actions/check-white.svg',
    description: '[TOKEN] on [WalletAddress]',
    actionPrompt: 'Check $TOKEN on $ADDRESS',
    actionType: ACTION_TYPES.CHECK_WALLET,
  },
  {
    label: 'Send',
    icon: '/icons/actions/send-action.svg',
    whiteIcon: '/icons/actions/send-action-white.svg',
    description: '[Amount] [Token] to [WalletAddress]',
    actionPrompt: 'Send $AMOUNT $TOKEN from my wallet to $ADDRESS',
    actionType: ACTION_TYPES.SEND,
  },
  {
    label: 'Swap',
    icon: '/icons/actions/swap.svg',
    whiteIcon: '/icons/actions/swap-white.svg',
    description: '[Amount] [Token] for [Token] on [dApp]',
    actionPrompt: 'Swap $AMOUNT $TOKEN for $TOKEN on $DAPP',
    actionType: ACTION_TYPES.SWAP,
  },
  // {
  //   label: 'Lend',
  //   icon: '/icons/actions/lend.svg',
  //   description: '[Amount] $BERA on [dApp]',
  //   actionPrompt: 'Lending $AMOUNT $BERA on $DAPP',
  //   actionType: ACTION_TYPES.LEND,
  // },
  {
    label: 'Withdraw',
    icon: '/icons/actions/withdraw.svg',
    description: '[Amount] $BERA on [dApp]',
    actionPrompt: 'Withdraw $AMOUNT $BERA on $DAPP',
    actionType: ACTION_TYPES.WITHDRAW,
  },
  {
    label: 'Provide liquidity',
    icon: '/icons/actions/provide-liq.svg',
    description: '[Token]-[Token] pool on [dApp]',
    actionPrompt: 'Provide liquidity on $LP_DAPP $AMOUNT $TOKEN / $AMOUNT $TOKEN pool',
    actionType: ACTION_TYPES.PROVIDE_LIQUIDITY,
  },
  {
    label: 'Remove liquidity',
    icon: '/icons/actions/remove-liq.svg',
    description: '[Token]-[Token] pool on [dApp]',
    actionPrompt: 'Remove liquidity $AMOUNT $LP_TOKEN Pool from $LP_DAPP',
    actionType: ACTION_TYPES.REMOVE_LIQUIDITY,
  },
  {
    label: 'Stake LP Tokens',
    icon: '/icons/actions/stake-lp.svg',
    description: '[Amount] LP tokens on [dApp]',
    actionPrompt: 'Stake $AMOUNT $LP_TOKEN on $LP_DAPP',
    actionType: ACTION_TYPES.STAKE_LP,
  },
  {
    label: 'Stake',
    icon: '/icons/actions/stake.svg',
    actionType: ACTION_TYPES.STAKE,
    description: '[Amount] iBGT/BGT on [dApp]',
    actionPrompt: 'Staking $AMOUNT $TOKEN on $DAPP',
  },
  {
    label: 'Unstake',
    icon: '/icons/actions/unstake.svg',
    actionType: ACTION_TYPES.UNSTAKE,
    description: '[Amount] iBGT/BGT on [dApp]',
    actionPrompt: 'Unstake $AMOUNT $TOKEN from $DAPP',
  },
  {
    label: 'Delegate BGT to validators',
    icon: '/icons/actions/delegate.svg',
    actionType: ACTION_TYPES.DELEGATE,
    description: '[Amount] $BGT to [Validator]',
    actionPrompt: 'Delegate $AMOUNT $BGT to $VALIDATOR',
  },
  {
    label: 'Redeem',
    icon: '/icons/actions/redeem.svg',
    actionType: ACTION_TYPES.REDEEM,
    description: '[Amount] $BGT for $BERA',
    actionPrompt: 'Redeem $AMOUNT $BGT for $BERA on Bera Hub',
  },
  {
    label: 'Deposit BERA at Memeswap',
    icon: '/icons/deposit.svg',
    actionType: ACTION_TYPES.MEMESWAP_DEPOSIT_BERA,
    description: '[Amount] $BERA on Memeswap',
    actionPrompt: 'Deposit $AMOUNT $BERA on Memeswap',
  },
  {
    label: 'Depsit BERA/HONEY at Webera',
    icon: '/icons/deposit.svg',
    actionType: ACTION_TYPES.WEBERA,
    description: '[Amount] $BERA/HONEY on Webera',
    actionPrompt: 'Deposit $AMOUNT $TOKEN on Webera',
  },
];

export const BASE_ACTIONS: IAction[] = [
  {
    label: 'Check portfolio',
    icon: '/icons/actions/portfolio.svg',
    whiteIcon: '/icons/actions/portfolio-white.svg',
    description: 'Check my portfolio balance',
    actionPrompt: 'Check my portfolio balance',
    actionType: ACTION_TYPES.CHECK_PORTFOLIO,
  },

  {
    label: 'Swap',
    icon: '/icons/actions/swap.svg',
    whiteIcon: '/icons/actions/swap-white.svg',
    description: '[Amount] [Token] for [Token] on [dApp]',
    actionPrompt: 'Swap $AMOUNT $TOKEN for $TOKEN on $DAPP',
    actionType: ACTION_TYPES.SWAP,
  },
  {
    label: 'Send',
    icon: '/icons/actions/send-action.svg',
    whiteIcon: '/icons/actions/send-action-white.svg',
    description: '[Amount] [Token] to [WalletAddress]',
    actionPrompt: 'Send $AMOUNT $TOKEN from my wallet to $ADDRESS',
    actionType: ACTION_TYPES.SEND,
  },
];

export const APTOS_TOKENS = [
  {
    label: 'APT',
    value: 'APT',
    address: '0x1::aptos_coin::AptosCoin',
    icon: '/icons/tokens/eth.svg',
  },
  {
    label: 'USDC',
    value: 'USDC',
    isStablecoin: true,
    address: '0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b',
    icon: '/icons/tokens/usdce.png',
  }
];

export const APTOS_ACTIONS: IAction[] = [
  {
    label: 'Check portfolio',
    icon: '/icons/actions/portfolio.svg',
    whiteIcon: '/icons/actions/portfolio-white.svg',
    description: 'Check my portfolio balance',
    actionPrompt: 'Check my portfolio balance',
    actionType: ACTION_TYPES.CHECK_PORTFOLIO,
  },

  {
    label: 'Swap',
    icon: '/icons/actions/swap.svg',
    whiteIcon: '/icons/actions/swap-white.svg',
    description: '[Amount] [Token] for [Token] on [dApp]',
    actionPrompt: 'Swap $AMOUNT $TOKEN for $TOKEN on $DAPP',
    actionType: ACTION_TYPES.SWAP,
  },
  {
    label: 'Send',
    icon: '/icons/actions/send-action.svg',
    whiteIcon: '/icons/actions/send-action-white.svg',
    description: '[Amount] [Token] to [WalletAddress]',
    actionPrompt: 'Send $AMOUNT $TOKEN from my wallet to $ADDRESS',
    actionType: ACTION_TYPES.SEND,
  },
];

export const DAPPS = [
  {
    label: 'Ooga Booga',
    value: 'oogabooga',
    previewValue: 'oogabooga',
    icon: '/icons/oogabooga.svg',
  },
  {
    label: 'Kodiak',
    value: 'kodiak',
    previewValue: 'kodiak',
    icon: '/icons/kodiak.svg',
  },
  {
    label: 'Bex',
    value: 'bex',
    previewValue: 'bex',
    icon: '/icons/bex.svg',
  },
  {
    label: 'Bera Hub',
    value: 'hub',
    previewValue: 'hub',
    icon: '/icons/bera-hub.svg',
  },
  {
    label: 'Haiku',
    value: 'haiku',
    previewValue: 'haiku',
    icon: '/icons/haiku.jpg',
  },
];

export const LP_DAPPS = [
  {
    label: 'Infrared',
    value: 'infrared',
    icon: '/icons/infrared.svg',
  },
  {
    label: 'Bera Hub',
    value: 'hub',
    icon: '/icons/bera-hub.svg',
  },
  {
    label: 'Kodiak V2',
    value: 'kodiak-v2',
    icon: '/icons/kodiak.svg',
  },
  {
    label: 'Kodiak V3',
    value: 'kodiak-v3',
    icon: '/icons/kodiak.svg',
  },
];

export const VALIDATORS: IPromptOption[] = [
  {
    label: 'Infrared by Luganodes',
    value: 'Infrared by Luganodes',
    icon: '/icons/validators/infrared-by-luganodes.png',
  },
  {
    label: 'Infrared by StakeLab',
    value: 'Infrared by StakeLab',
    icon: '/icons/validators/infrared-by-stakelab.png',
  },
  {
    label: 'Infrared by Pier Two',
    value: 'Infrared by Pier Two',
    icon: '/icons/validators/infrared-by-pier-two.png',
  },
  {
    label: 'Infrared by CoinSummer Labs',
    value: 'Infrared by CoinSummer Labs',
    icon: '/icons/validators/infrared-by-coinsummer.png',
  },
  {
    label: 'Infrared by A41',
    value: 'Infrared by A41',
    icon: '/icons/validators/infrared-by-a41.png',
  },
  {
    label: 'Infrared by RockawayX',
    value: 'Infrared by RockawayX',
    icon: '/icons/validators/default.svg',
  },
  {
    label: '0xad...6651',
    value: '0xaabc7a11f7d6c4d8d27687d4ff78536e4e46d09db7be0cc861e208902631d2d4',
    icon: '/icons/validators/default.svg',
  },
  {
    label: 'Infrared by Cephalopod Equipment',
    value: 'Infrared by Cephalopod Equipment',
    icon: '/icons/validators/cephalopod.png',
  },
  {
    label: 'Falcon Nest',
    value: 'Falcon Nest',
    icon: '/icons/validators/default.svg',
  },
  {
    label: 'The Honey Jar',
    value: 'The Honey Jar',
    icon: '/icons/validators/the-honey-jar.jpg',
  },
];

export const DISPLAY_PROMPT_CONFIG: Record<string, IPromptConfig> = {
  TOKEN: {
    component: COMPONENTS.AUTOCOMPLETE,
    type: INPUT_TYPES.TEXT,
    wrapperClassName: 'bg-background-action-input text-black rounded-sm max-w-[100px] h-[30px]',
    inputClassName: '!px-1 h-full text-center',
    autoCompleteOptions: { [CHAIN_ID.MAINNET]: APTOS_TOKENS, [CHAIN_ID.TESTNET]: APTOS_TOKENS },
    placeholder: 'Token',
    validation: {
      required: true,
    },
    errorMessage: 'Token required',
    maxOptions: 5,
    filterOption: (inputValue, option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.value.toLowerCase().includes(inputValue.toLowerCase()),
    contextFilter: [
      {
        actionType: ACTION_TYPES.STAKE,
        validValues: ['BGT', 'iBGT'],
      },
      {
        actionType: ACTION_TYPES.UNSTAKE,
        validValues: ['BGT', 'iBGT'],
      },
      {
        actionType: ACTION_TYPES.WEBERA,
        validValues: ['BERA', 'HONEY'],
      },
      // {
      //   actionType: ACTION_TYPES.DELEGATE,
      //   validValues: ['BGT'],
      // },
      // {
      //   actionType: ACTION_TYPES.SWAP,
      //   // For SWAP, we'll use a simpler approach that doesn't rely on inputValues
      //   // The actual token filtering logic will be handled in useActions.tsx
      // },
      // {
      //   actionType: ACTION_TYPES.LEND,
      //   validValues: ['USDC.e', 'USDe', 'BYUSD', 'NECT', 'rUSD', 'WBERA', 'WETH', 'WBTC'],
      // },
      // {
      //   actionType: ACTION_TYPES.REDEEM,
      //   filterFn: (actionPrompt, option) => {
      //     return ['BGT', 'stBGT', 'LBGT'].includes(option.value);
      //   },
      // },
    ],
  },
  ADDRESS: {
    component: COMPONENTS.INPUT,
    type: INPUT_TYPES.TEXT,
    wrapperClassName: 'bg-background-action-input text-black rounded-sm h-[30px]',
    inputClassName: '!px-1 h-full text-center',
    placeholder: 'WALLET ADDRESS',
    validation: {
      required: true,
      pattern: /^0x[a-fA-F0-9]{40}$/,
      minLength: 42,
      maxLength: 42,
    },
    errorMessage: (value) =>
      !value
        ? 'Address required'
        : value.length < 42
          ? 'Address too short'
          : value.length > 42
            ? 'Address too long'
            : !value.startsWith('0x')
              ? 'Address must start with 0x'
              : 'Invalid address format',
  },
  AMOUNT: {
    component: COMPONENTS.INPUT,
    type: INPUT_TYPES.TEXT,
    wrapperClassName: 'bg-background-action-input rounded-sm text-black h-[30px] w-20',
    inputClassName: '!px-1 h-full text-center',
    placeholder: 'AMOUNT',
    validation: {
      type: INPUT_TYPES.NUMBER,
      required: true,
      pattern: /^[0-9]*\.?[0-9]+$/,
      customValidator: (value) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
          return {
            valid: false,
            message: 'Amount must be positive',
          };
        }
        return true;
      },
    },
    errorMessage: 'Valid amount required',
  },
  VALIDATOR: {
    component: COMPONENTS.SELECT,
    wrapperClassName: 'bg-background-action-input rounded-sm h-[30px] w-[200px]',
    inputClassName: '!px-1 h-full',
    placeholder: 'VALIDATOR',
    validation: {
      required: true,
    },
    options: VALIDATORS,
    defaultValue: VALIDATORS[0].value,
  },
  DAPP: {
    component: COMPONENTS.SELECT,
    wrapperClassName: 'bg-background-action-input text-black rounded-sm h-[30px] w-[150px] ',
    inputClassName: '!px-1',
    autoCompleteOptions: { [CHAIN_ID.MAINNET]: DAPPS, [CHAIN_ID.TESTNET]: DAPPS },
    validation: {
      required: true,
    },
    placeholder: 'DAPP',
    options: DAPPS,
    defaultValue: DAPPS[0].value,
    contextFilter: [],
  },
  LP_TOKEN: {
    component: COMPONENTS.SELECT,
    wrapperClassName: 'bg-background-action-input text-black rounded-sm h-[30px] w-[150px] ',
    inputClassName: '!px-1',
    autoCompleteOptions: { [CHAIN_ID.MAINNET]: BASE_TOKENS, [CHAIN_ID.TESTNET]: BERACHAIN_TOKENS },
    placeholder: 'LP TOKEN',
    validation: {
      required: true,
    },
    options: LP_TOKENS,
    defaultValue: LP_TOKENS[0].value,
  },
  LP_DAPP: {
    component: COMPONENTS.SELECT,
    wrapperClassName: 'bg-background-action text-black rounded-sm h-[30px] w-[150px] ',
    inputClassName: '!px-1',
    validation: {
      required: true,
    },
    placeholder: 'DAPP',
    options: LP_DAPPS,
    defaultValue: LP_DAPPS[0].value,
    contextFilter: [
      {
        actionType: ACTION_TYPES.PROVIDE_LIQUIDITY,
        validValues: ['hub', 'kodiak-v2', 'kodiak-v3'],
      },
      {
        actionType: ACTION_TYPES.REMOVE_LIQUIDITY,
        validValues: ['hub', 'kodiak-v2', 'kodiak-v3'],
      },
      {
        actionType: ACTION_TYPES.STAKE_LP,
        validValues: ['infrared', 'hub'],
      },
      {
        actionType: ACTION_TYPES.STAKE,
        validValues: ['infrared', 'hub'],
      },
      {
        actionType: ACTION_TYPES.UNSTAKE,
        validValues: ['infrared', 'hub'],
      },
    ],
  },
};
