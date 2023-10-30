import { Component, createSignal, JSX, onMount } from "solid-js";
import { CheckBox } from "./CheckBox";
import { SmallLabel } from "./Label";

export enum UMLAccessModifiers { 
    Public = '+',
    Private = '-',
    Proteced = '#',
    Internal = '~',
}

export interface IUMLAccessModifiers { 
    accessModifier?: UMLAccessModifiers;
}

export const UMLAccessModifiersContainer : Component<{
    id: string,
    initValue?: UMLAccessModifiers,
    onChange: (accessModifier:UMLAccessModifiers)=>void
}> = (props) => { 
    const [accessModifier, setAccessModifier] = createSignal<UMLAccessModifiers>(props.initValue);

    function updateAccessModifier(modifiers:UMLAccessModifiers) { 
        var state = accessModifier() != modifiers ? modifiers : undefined;

        setAccessModifier(state);
        props.onChange(state);
    }

    return (
        <>
        <SmallLabel title="Access Modifiers"/>
        <div class="grid grid-cols-2 gap-x-3">
            <div class="flex flex-col">
                <CheckBox 
                    title="Public (+)" 
                    id={`public-${props.id}`}
                    value={accessModifier() === UMLAccessModifiers.Public} 
                    onChanges={() => updateAccessModifier(UMLAccessModifiers.Public)} />
                <CheckBox 
                    title="Protected (#)" 
                    id={`protected-${props.id}`}
                    value={accessModifier() === UMLAccessModifiers.Proteced} 
                    onChanges={() => updateAccessModifier(UMLAccessModifiers.Proteced)}/>
            </div>
            <div class="flex flex-col ">
                <CheckBox 
                    title="Private (-)"
                    id={`private-${props.id}`}
                    value={accessModifier() === UMLAccessModifiers.Private} 
                    onChanges={() => updateAccessModifier(UMLAccessModifiers.Private)} />
                <CheckBox 
                    title="Internal (~)" 
                    id={`internal-${props.id}`}
                    value={accessModifier() === UMLAccessModifiers.Internal} 
                    onChanges={() => updateAccessModifier(UMLAccessModifiers.Internal)}/>
            </div>
        </div>
        </>);
};

