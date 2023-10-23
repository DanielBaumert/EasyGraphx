import { ImplementsNameSymbolIUMLDervice, getImplementsNameSymbol } from "./Symbols";
import { UMLClass } from "./UMLClass";

export interface IUMLDerive { 
    parent : UMLClass,
    children : UMLClass   
}

export class UMLClassDerive implements IUMLDerive {
    parent: UMLClass;
    children: UMLClass;

    [getImplementsNameSymbol]() { 
        return ImplementsNameSymbolIUMLDervice;
    }

    constructor(parent: UMLClass, children: UMLClass){
        this.parent =  parent;
        this.children = children;
    }    
}

export class UMLInterfaceDerive implements IUMLDerive {
    parent: UMLClass;
    children: UMLClass;

    [getImplementsNameSymbol]() { 
        return ImplementsNameSymbolIUMLDervice;
    }

    constructor(parent: UMLClass, children: UMLClass){
        this.parent =  parent;
        this.children = children;
    }    
}

