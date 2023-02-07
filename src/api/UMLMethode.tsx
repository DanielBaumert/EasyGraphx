import { StringBuilder } from "./StringBuilder";

export interface IUMLParameter {
    name?: string;
    type?: string;
    toString(): string;
}

export class UMLParameter implements IUMLParameter {
    name?: string;
    type?: string;
    
    toString(): string {
        var sb = new StringBuilder();
        return sb.toString();
    } 
}

export interface IUmlMethode {
    isStatic?: boolean;
    accessModifier?: string;
    name: string;
    returnType?: string;

    toString(): string;
}

