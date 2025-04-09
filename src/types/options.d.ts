
export interface OptionType {
  bid: number;
  ask: number;
  price: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  iv: number; // Implied volatility
}

export interface OptionData {
  symbol: string;
  strike: number;
  expirationDate: string;
  call: OptionType;
  put: OptionType;
}

export type OptionsViewType = "expiration" | "strike";
