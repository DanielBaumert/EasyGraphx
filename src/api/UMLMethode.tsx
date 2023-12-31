import { createSignal, ParentComponent, Show } from "solid-js";
import { Button } from "./Button";
import { CheckBox } from "./CheckBox";
import { Field } from "./Field";
import { SmallLabel } from "./Label";
import { StringBuilder } from "./StringBuilder";
import { UMLAccessModifiers, IUMLAccessModifiers, UMLAccessModifiersContainer } from "./UMLAccessModifiers";
import { UMLParameter } from "./UMLParameter";
import { startUpdateView } from "./GlobalState";


export interface IUMLMethode extends IUMLAccessModifiers {
    isStatic?: boolean;
    name: string;
    returnType?: string;
    parameters?: UMLParameter[];
    toString(): string;
}

export class UMLMethode implements IUMLMethode {
    isStatic?: boolean;
    name: string;
    accessModifier?: UMLAccessModifiers;
    parameters: UMLParameter[];
    returnType?: string;

    constructor() {
        this.name = "methode";
        this.parameters = [];
    }

    toString(): string {
        var sb = new StringBuilder();

        if (this.accessModifier) {
            sb.write(this.accessModifier).write(' ');
        }

        sb.write(this.name).write('(')
            .write(this.parameters.map(x => x.toString()).join(", "))
            .write(')');

        if (this.returnType) {
            sb.write(':').write(this.returnType);
        } else {
            sb.write(":void");
        }

        return sb.toString();
    }
}

export const UMLMethodeContainer: ParentComponent<{
    index: number,
    methode: UMLMethode,
    delete: Function,
    onPushParameter: Function
}> = (props) => {
    const [isExpanded, setExpanded] = createSignal<boolean>();
    const [isMethodeNameNotEmpty, setMethodeNameNotEmpty] = createSignal<boolean>(props.methode.name !== "");

    function onMethodeNameInputChanged(e) {
        props.methode.name = e.currentTarget.value;
        setMethodeNameNotEmpty(props.methode.name !== "");
        startUpdateView();
    }

    function onStaticPropertyStateChanged(e) {
        props.methode.isStatic = e.currentTarget.checked;
        startUpdateView();
    }

    function onReturnTypeInputChanged(e) {
        props.methode.returnType = e.currentTarget.value;
        startUpdateView();
    }

    return (
        <div class={`relative flex flex-row bg-white rounded border ${isMethodeNameNotEmpty() ? "border-sky-400" : "border-red-400"} p-2 mb-2 shadow`}>
            <Show when={isExpanded()}>
                <div class="flex flex-col">
                    <Field
                        title="Name"
                        initValue={props.methode.name}
                        onInputChange={onMethodeNameInputChanged} />
                    <CheckBox
                        id={`static-methode-${props.index}`}
                        title="Static"
                        value={props.methode.isStatic}
                        onChanges={onStaticPropertyStateChanged} />
                    <UMLAccessModifiersContainer
                        id={`methode-${props.index}`}
                        initValue={props.methode.accessModifier}
                        onChange={(mod: UMLAccessModifiers) => { props.methode.accessModifier = mod; startUpdateView(); }} />
                    <SmallLabel title="Parameters" />
                    <Button title='Add parameter' onclick={() => props.onPushParameter()} />
                    <div class="flex flex-col p-1 rounded border border-sky-400">
                        {props.children}
                    </div>
                    <Field title="Return type"
                        initValue={props.methode.returnType}
                        onInputChange={onReturnTypeInputChanged} />
                    <button class="
                        py-1 w-full rounded mb-1 
                        border border-gray-200 
                        text-sm font-medium text-gray-700 
                        hover:bg-red-500 hover:text-white hover:shadow"
                        onClick={() => props.delete()}>
                        Delete
                    </button>
                </div>
            </Show>
            <Show when={!isExpanded()}>
                <label for={this}
                    class="text-sm text-gray-500 duration-300 scale-75 origin-[0]">
                    {isMethodeNameNotEmpty() ? props.methode.name : "unnamed"}
                </label>
            </Show>
            <div class="absolute flex flex-row top-1.5 right-1">
                <div class={isExpanded() ? 'group rotate-180' : 'group'} onClick={() => setExpanded(!isExpanded())}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 shrink-0 fill-gray-500 group-hover:fill-black group-hover:shadow" fill="none" viewBox="0 0 20 20" >
                        <path stroke-linecap="round" stroke-linejoin="round" d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' />
                    </svg>
                </div>
            </div>
        </div>
    )
}