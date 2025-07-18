export enum ACTION_TYPES {
  CHECK_PORTFOLIO = 'check-portfolio',
  CHECK_WALLET = 'check-wallet',
  SEND = 'send',
  SWAP = 'swap',
  LEND = 'lend',
  WITHDRAW = 'withdraw',
  PROVIDE_LIQUIDITY = 'provide-liquidity',
  REMOVE_LIQUIDITY = 'remove-liquidity',
  MINT = 'mint',
  BURN = 'burn',
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  DELEGATE = 'delegate',
  REDEEM = 'redeem',
  STAKE_LP = 'stake-lp',
  DEFAULT = 'default',
  MEMESWAP_DEPOSIT_BERA = 'memeswap-deposit-bera',
  WEBERA = 'webera',
}

export interface IActionChildren {
  label: string;
  icon: string;
  description?: string;
  actionPrompt?: string;
  actionType: ACTION_TYPES;
}

export interface IAction {
  label: string;
  icon: string;
  whiteIcon?: string;
  description?: string;
  children?: IActionChildren[];
  actionPrompt?: string;
  actionType: ACTION_TYPES;
}

export interface IPromptOption {
  label: string;
  value: string;
  icon?: string;
}

export enum COMPONENTS {
  INPUT = 'input',
  SELECT = 'select',
  AUTOCOMPLETE = 'autocomplete',
}

export enum INPUT_TYPES {
  TEXT = 'text',
  NUMBER = 'number',
}

export interface IPromptConfig {
  component: COMPONENTS;
  type?: INPUT_TYPES;
  options?: IPromptOption[];
  wrapperClassName?: string;
  inputClassName?: string;
  autoCompleteOptions?: { [chainId: string]: IPromptOption[] };
  validation?: {
    required?: boolean;
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    type?: INPUT_TYPES;
    customValidator?: (value: string) => boolean | { valid: false; message: string };
  };
  errorMessage?: string | ((value: string) => string);
  placeholder?: string;
  defaultValue?: string;
  maxOptions?: number;
  filterOption?: (inputValue: string, option: IPromptOption) => boolean;
  formatOptionLabel?: (option: IPromptOption) => React.ReactNode;
  contextFilter?: {
    actionType?: ACTION_TYPES;
    validValues?: string[];
  }[];
}

export interface IValidationResult {
  valid: boolean;
  message?: string;
}
