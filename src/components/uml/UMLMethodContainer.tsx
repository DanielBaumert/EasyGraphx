import { useEffect, useState } from "react";
import { Button, ButtonDelete, CheckBox, IconDropDownArrow, Field, LabelSmall, UMLAccessModifiersContainer, TabContainer, UMLParameterContainer } from "..";
import Show from "../controlflow/Show";
import { UMLAccessModifiers, UMLMethode } from "../../api/Uml";


type UMLMethodContainerProps = {
  index: number;
  methode: UMLMethode;
  update: (umlMethode: UMLMethode) => void;
};

export default (props: UMLMethodContainerProps) => {

  const [isExpanded, setExpanded] = useState<boolean>(true);
  const [isMethodeNameNotEmpty, setMethodeNameNotEmpty] = useState<boolean>(false);

  const [accessModifier, setAccessModifier] = useState<UMLAccessModifiers|undefined>(props.methode.accessModifier ?? undefined);
  const [methodeName, setMethodeName] = useState<string>(props.methode.name);
  const [isStatic, setIsStatic] = useState<boolean>(props.methode.isStatic ?? false);
  const [returnType, setReturnType] = useState<string>(props.methode.returnType ?? "");
  const [parameters, setParameters] = useState(props.methode.parameters ?? []);

  useEffect(() => {
    updateNode({ 
      isStatic: isStatic,
      accessModifier: accessModifier,
      name: methodeName,
      returnType: returnType,
      parameters: parameters
    });
  }, [accessModifier, methodeName, isStatic, returnType, parameters]);

  const updateNode = (newData: Partial<UMLMethode>) => {
    const updatedMethode = { ...props.methode, ...newData };
    props.update(updatedMethode);
  }

  useEffect(() => {
    setMethodeNameNotEmpty(methodeName !== "");
  }, [methodeName]);

  return (
    <TabContainer isExpanded={isExpanded} onToggleExpand={state => setExpanded(state)} >
      <Show when={isExpanded}>
        <div className="flex flex-col">
          <Field
            title="Name"
            initValue={props.methode.name}
            onInputChange={e => setMethodeName(e.currentTarget.value)} />
          <CheckBox
            id={`static-methode-${props.index}`}
            title="Static"
            initValue={isStatic}
            onChanges={e => setIsStatic(e.currentTarget.checked)} />
          <UMLAccessModifiersContainer
            id={`methode-${props.index}`}
            initValue={accessModifier}
            onChange={(mod) => setAccessModifier(mod)} />
          <LabelSmall title="Parameters" />
          <div className="py-2">
            <Button title='Add parameter'
            // onclick={() => props.onPushParameter()} 
            />
          </div>
          <Show when={parameters.length !== 0}>
            <div className="flex flex-col p-1 rounded border-2 border-sky-400 mb-2">
              {parameters.map((param, index) => (
                <UMLParameterContainer key={index} 
                umlParameter={param} 
                updateParameter={(updatedParam) =>
                  setParameters(prev => {
                    const newParams = [...prev];
                    newParams[index] = updatedParam;
                    return newParams;
                  })
                } />
              ))}
            </div>
          </Show>
          <Field title="Return type"
            initValue={props.methode.returnType}
            onInputChange={e => setReturnType(e.currentTarget.value)} />
          <ButtonDelete title="Delete" />
        </div>
      </Show>
      <Show when={!isExpanded}>
        <label htmlFor={this}
          className="text-sm text-gray-500 duration-300 scale-75 origin-[0]">
          {isMethodeNameNotEmpty ? props.methode.name : "unnamed"}
        </label>
      </Show>
      <div className="absolute flex flex-row top-1.5 right-1">
        <div className={isExpanded ? 'group rotate-180' : 'group'} onClick={() => setExpanded(!isExpanded)}>
          <IconDropDownArrow />
        </div>
      </div>
    </TabContainer>
  )
}