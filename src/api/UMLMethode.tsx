import { Component, createSignal, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { CheckBox } from "./CheckBox";
import { Field } from "./Field";
import { StringBuilder } from "./StringBuilder";
import { AccessModifiers, IUMLAccessModifiers, UMLAccessModifiersContainer } from "./UMLAccessModifiers";

export interface IUMLParameter {
    name?: string;
    type?: string;
    toString(): string;
}

export class UMLParameter{
    name?: string;
    type?: string;
    
    toString(): string {
        var sb = new StringBuilder();

        if(this.name) { 
            sb.write(this.name);
            if(this.type){ 
                sb.write(":").write(this.type);
            }
        } else if(this.type){ 
            sb.write(this.type);
        }

        return sb.toString();
    } 
}

export interface IUMLMethode extends IUMLAccessModifiers  {
    isStatic?: boolean;
    name: string;
    returnType?: string;
    parameters?: UMLParameter[];
    toString(): string;
}

export class UMLMethode implements IUMLMethode {
    isStatic?: boolean;
    name: string;
    returnType?: string;
    accessModifier?: AccessModifiers;
    parameters?: UMLParameter[];

    constructor() { 
        this.name = "methode";
        this.parameters = [];
    }

    toString(): string {
        var sb = new StringBuilder();        
        
        if(this.accessModifier) {
            sb.write(this.accessModifier).write(' ');
        }

        sb.write(this.name).write('(')
          .write(this.parameters.map(x => x.toString()).join(", "))
          .write(')');

        if(this.returnType){ 
            sb.write(':').write(this.returnType);
        } else { 
            sb.write(":void");
        }

        return sb.toString();
    }
}


export const UMLMethodeContainer: Component<{
    index: number,
    methode: UMLMethode,
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
                    <Field 
                        title="Name"
                        initValue={props.methode.name}
                        onInputChange={e => { props.methode.name = e.currentTarget.value; props.update() }} />
                    <CheckBox 
                        id={`static-methode-${props.index}`} 
                        title="Static"
                        value={props.methode.isStatic}
                        onChanges={e => {props.methode.isStatic = e.currentTarget.checked; props.update();}}/>  
                    <UMLAccessModifiersContainer 
                        id={`methode-${props.index}`} 
                        initValue={props.methode.accessModifier} 
                        onChange={(mod: AccessModifiers) => {props.methode.accessModifier = mod; props.update();}} />
                    <Field title="Return type"
                        initValue={props.methode.returnType}
                        onInputChange={e => { props.methode.returnType = e.currentTarget.value; props.update() }} />
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
                {props.methode.name}
            </label>
            </Show>
            <div class="absolute flex flex-row top-1.5 right-1">
                <div class={isExpanded() ? 'group rotate-180' : 'group'} onClick={e => setExpanded(!isExpanded())}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 shrink-0 fill-gray-500 group-hover:fill-black group-hover:shadow" fill="none" viewBox="0 0 20 20" >
                        <path strokeLinecap="round" strokeLinejoin="round" d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' />
                    </svg>
                </div>
            </div>
        </div>
    )
}