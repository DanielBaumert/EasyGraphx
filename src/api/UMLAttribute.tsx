import { Component, createSignal, JSX, Show } from "solid-js";
import { CheckBox } from "./CheckBox";
import { Field } from "./Field";
import { StringBuilder } from "./StringBuilder";
import { AccessModifiers, IUMLAccessModifiers, UMLAccessModifiersContainer } from "./UMLAccessModifiers";

export interface IUmlAttribute extends IUMLAccessModifiers {
    isStatic?: boolean;
    isConstant?: boolean;
    accessModifier?: AccessModifiers;
    name: string;
    type?: string;
    multiplicity?: number;
    defaultValue?: string;
    toString(): string;
}

export class UMLAttribute implements IUmlAttribute {
    isStatic?: boolean;
    isConstant?: boolean;
    accessModifier?: AccessModifiers;
    name: string;
    type?: string;
    multiplicity?: number;
    defaultValue?: string;

    constructor() {
        this.name = "attribute";
    }

    toString(): string {
        var sb = new StringBuilder();
        if(this.accessModifier){ 
            sb.write(this.accessModifier).write(" ");
        }
        sb.write(this.isConstant ? this.name.toUpperCase() : this.name);
        if (this.type) {
            sb.write(':').write(this.type);
        }
        if(this.defaultValue) { 
            sb.write('=').write(this.defaultValue);
        }
        return sb.toString();
    }
}

export const UMLAttributeContainer: Component<{
    index: number,
    attr: UMLAttribute,
    onDrop: JSX.EventHandlerUnion<HTMLDivElement, DragEvent>,
    delete: Function,
    update: Function,
}> = (props) => {
    const [isExpanded, setExpanded] = createSignal<boolean>();

    function onDragStart(e:DragEvent) { 
        e.dataTransfer.setData("number", props.index.toString());
    }   

    return (
        <div draggable={true} 
            onDrop={props.onDrop} 
            onDragOver={e => e.preventDefault()} 
            onDragStart={onDragStart} 
            class="relative flex flex-row bg-white rounded border border-sky-400 p-2 mb-2 shadow">
            <Show when={isExpanded()}>
                <div class="flex flex-col">
                    <Field title="Name"
                        initValue={props.attr.name}
                        onInputChange={e => { props.attr.name = e.currentTarget.value; props.update() }} />
                    <div class="grid grid-cols-2">
                        <CheckBox 
                            id={`static-attribute-${props.index}`} 
                            title="Static"
                            value={props.attr.isStatic}
                            onChanges={e => {props.attr.isStatic = e.currentTarget.checked; props.update();}}/>  
                        <CheckBox 
                            id={`constant-attribute-${props.index}`} 
                            title="Constant"
                            value={props.attr.isConstant}
                            onChanges={e => {props.attr.isConstant = e.currentTarget.checked; props.update();}}/> 
                    </div>
                    <UMLAccessModifiersContainer 
                        id={`attribute-${props.index}`}
                        initValue={props.attr.accessModifier} 
                        onChange={(mod) => {props.attr.accessModifier = mod; props.update();}} />
                    <Field title="Type"
                        initValue={props.attr.type}
                        onInputChange={e => { props.attr.type = e.currentTarget.value; props.update() }} />
                    <Field title="Default value"
                        initValue={props.attr.defaultValue}
                        onInputChange={e => { props.attr.defaultValue = e.currentTarget.value; props.update() }} />
                    <button class="
                        py-1 w-full rounded mb-1 
                        border border-gray-200 
                        text-sm font-medium text-gray-700 
                        hover:bg-red-500 hover:text-white hover:shadow"
                        onClick={e => props.delete()}>
                        Delete
                    </button>
                </div>
            </Show>
            <Show when={!isExpanded()}>
            <label for={this} 
                class="
                text-sm text-gray-500 
                dark:text-gray-400 duration-300 
                scale-75 origin-[0]">
                {props.attr.name}
            </label>
            </Show>
            <div class="absolute flex flex-row top-1.5 right-1">
                <div class={isExpanded() ? 'group rotate-180' : 'group'} onClick={e => { setExpanded(!isExpanded()); console.log("expande");}}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 shrink-0 fill-gray-500 group-hover:fill-black" fill="none" viewBox="0 0 20 20" >
                        <path strokeLinecap="round" strokeLinejoin="round" d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' />
                    </svg>
                </div>
            </div>
        </div>
    )
}


