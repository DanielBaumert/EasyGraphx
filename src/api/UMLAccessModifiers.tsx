import { Component, createSignal, JSX, onMount } from "solid-js";
import { CheckBox } from "./CheckBox";

export enum AccessModifiers { 
    Public = '+',
    Private = '-',
    Proteced = '#',
    Internal = '~',
}

export interface IUMLAccessModifiers { 
    accessModifier?: AccessModifiers;
}

export const UMLAccessModifiersContainer : Component<{
    initValue?: AccessModifiers,
    onChange: Function
}> = (props) => { 
    const [accessModifier, setAccessModifier] = createSignal<AccessModifiers>(props.initValue);

    function updateAccessModifier(modifiers:AccessModifiers) { 
        var state = accessModifier() != modifiers ? modifiers : undefined;

        setAccessModifier(state);
        props.onChange(state);
    }

    return (
        <>
        <label class="font-small text-xs text-gray-500">Access Modifiers</label>
        <div class="grid grid-cols-2 gap-x-3">
            <div class="flex flex-col">
                <CheckBox title="Public (+)" 
                    value={accessModifier() === AccessModifiers.Public} 
                    onChanges={e => updateAccessModifier(AccessModifiers.Public)} />
                <CheckBox title="Protected (#)" 
                    value={accessModifier() === AccessModifiers.Proteced} 
                    onChanges={e => updateAccessModifier(AccessModifiers.Proteced)}/>
            </div>
            <div class="flex flex-col ">
                <CheckBox title="Private (-)"
                    value={accessModifier() === AccessModifiers.Private} 
                    onChanges={e => updateAccessModifier(AccessModifiers.Private)} />
                <CheckBox title="Internal (~)" 
                    value={accessModifier() === AccessModifiers.Internal} 
                    onChanges={e => updateAccessModifier(AccessModifiers.Internal)}/>
            </div>
        </div>
        </>);
};

