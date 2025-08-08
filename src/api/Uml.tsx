export enum UMLAccessModifiers {
  Public = '+',
  Private = '-',
  Protected = '#',
  Internal = '~',
}

export type UMLClass = {
  name: string;
  property: string;
  isAbstract?: boolean;
  attributes: UMLAttribute[];
  methods: UMLMethode[];
}

export type UMLAttribute = {
  isStatic?: boolean;
  isConstant?: boolean;
  accessModifier?: UMLAccessModifiers;
  name: string;
  type?: string;
  multiplicity?: number;
  defaultValue?: string;
}

export type UMLMethode = {
  accessModifier?: UMLAccessModifiers;
  isStatic?: boolean;
  name: string;
  returnType?: string;
  parameters?: UMLParameter[];
}

export type UMLParameter = {
  name: string;
  type?: string;
  defaultValue?: string;
};