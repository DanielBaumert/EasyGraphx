export enum UMLAccessModifiers {
  Public = '+',
  Private = '-',
  Protected = '#',
  Internal = '~',
}

export type UMLClass = {
  __type__: 'class';
  accessModifier?: UMLAccessModifiers;
  name: string;
  property: string;
  isAbstract?: boolean;
  attributes: UMLAttribute[];
  methods: UMLMethode[];
}

export type UMLAttribute = {
  __type__: 'attribute';
  isStatic?: boolean;
  isConstant?: boolean;
  accessModifier?: UMLAccessModifiers;
  name: string;
  type?: string;
  multiplicity?: number;
  defaultValue?: string;
}

export type UMLMethode = {
  __type__: 'method';
  isStatic?: boolean;
  accessModifier?: UMLAccessModifiers;
  name: string;
  returnType?: string;
  parameters?: UMLParameter[];
}

export type UMLParameter = {
  __type__: 'parameter';
  name: string;
  type?: string;
  defaultValue?: string;
}

class StringBuilder {
  private _lines: string[] = [];

  write(line: string = ''): StringBuilder {
    this._lines.push(line);
    return this;
  }

  newline(): StringBuilder {
    this._lines.push(`
      `);
    return this;
  }

  writeln(line: string = ''): StringBuilder {
    this._lines.push(line);
    this._lines.push('\n');
    return this;
  }

  toString(): string {
    return this._lines.join('');
  }
}


function onUMLAttributeToString(umlAttribute: UMLAttribute): string {
  let sb = new StringBuilder();
  if (umlAttribute.accessModifier) {
    sb.write(umlAttribute.accessModifier).write(' ');
  }

  if (umlAttribute.isConstant) {
    sb.write(umlAttribute.name.toUpperCase());
  }
  else {
    sb.write(umlAttribute.name);
  }

  if (umlAttribute.type) {
    sb.write(' : ').write(umlAttribute.type);
  }
  if (umlAttribute.defaultValue) {
    sb.write(' = ').write(umlAttribute.defaultValue);
  }
  return sb.toString();
}

function onUMLParameterToString(umlParameter: UMLParameter): string {
  let sb = new StringBuilder();

  if (umlParameter.name) {
    sb.write(umlParameter.name);
    if (umlParameter.type) {
      sb.write(":").write(umlParameter.type);
    }
  } else if (umlParameter.type) {
    sb.write(umlParameter.type);
  }

  return sb.toString();
}

function onUMLMethodeToString(umlMethode: UMLMethode): string {
  let sb = new StringBuilder();

  if (umlMethode.accessModifier) {
    sb.write(umlMethode.accessModifier).write(' ');
  }

  sb.write(umlMethode.name).write('(')
    .write(umlMethode.parameters?.map((x: UMLParameter) => UmlToString(x)).join(", ") ?? '')
    .write(')');

  if (umlMethode.returnType) {
    sb.write(':').write(umlMethode.returnType);
  } else {
    sb.write(":void");
  }

  return sb.toString();
}

function onUMLClassToString(umlClass: UMLClass): string {
  let sb = new StringBuilder();

  if (umlClass.property !== undefined) {
    sb.write("<<").write(umlClass.property).write(">>").newline();
  }

  sb.write(umlClass.name);

  if (umlClass.isAbstract) {
    sb.newline().write("{abstract}");
  }

  return sb.toString();
}

export function UmlToString(umlAttribute: UMLAttribute): string;
export function UmlToString(umlParameter: UMLParameter): string;
export function UmlToString(umlMethode: UMLMethode): string;
export function UmlToString(umlClass: UMLClass): string;
export function UmlToString(
  uml: UMLAttribute | UMLParameter | UMLMethode | UMLClass): string|never {

  switch (uml.__type__) {
    case 'attribute':
      return onUMLAttributeToString(uml as UMLAttribute);
    case 'parameter':
      return onUMLParameterToString(uml as UMLParameter);
    case 'method':
      return onUMLMethodeToString(uml as UMLMethode);
    case 'class':
      return onUMLClassToString(uml as UMLClass);
    default:
      console.error("UML type is undefined", uml);
      throw new Error("UML type is undefined");
  }
}