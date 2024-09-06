import TextDecoration from "./TextDecoration";

type TextBlock = { 
  width: number,
  height: number
  baseline: number;
} 
export type SingleTextBlock = {
  value: string,
  decoration: TextDecoration; 
} & TextBlock;

export type MultiTextBlock = { 
  value: SingleTextBlock[]
} & TextBlock;
