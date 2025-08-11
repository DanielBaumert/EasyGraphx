import { useEffect, useState } from "react";
import { CheckBox, IconDropDownArrow, Field, Show, UMLAccessModifiersContainer, TabContainer } from "..";
import { UMLAccessModifiers, UMLAttribute } from "../../api/Uml";

//   export const UMLAttributeContainer: Component<{
//   index: number,
//   attr: UMLAttribute,
//   delete: Function,
//   update: Function,
// }> = (props) => {

type UMLAttributeProps = {
  index: number;
  attr: UMLAttribute;
  update: (umlAttribute: UMLAttribute) => void;
  delete: () => void;
}


export default (props: UMLAttributeProps) => {

  const [accessModifier, setAccessModifier] = useState<UMLAccessModifiers|undefined>(props.attr.accessModifier ?? undefined);
  const [name, setName] = useState<string>(props.attr.name);
  const [type, setType] = useState<string>(props.attr.type ?? "");
  const [defaultValue, setDefaultValue] = useState<string>(props.attr.defaultValue ?? "");
  const [isStatic, setIsStatic] = useState<boolean>(props.attr.isStatic ?? false);
  const [isConstant, setIsConstant] = useState<boolean>(props.attr.isConstant ?? false);

  useEffect(() => {
    updateNode({ 
      accessModifier: accessModifier,
      name: name,
      type: type,
      defaultValue: defaultValue,
      isStatic: isStatic,
      isConstant: isConstant
     });
  }, [accessModifier, name, type, defaultValue, isStatic, isConstant]);

  function updateNode(newData: Partial<UMLAttribute>) {
    const attr = { ...props.attr, ...newData };
    props.update(attr);
  }
  
  const [isExpanded, setExpanded] = useState<boolean>(true);
  const [isAttributeNameNotEmpty, setAttributeNameNotEmpty] = useState<boolean>(props.attr.name !== "");

  useEffect(() => {
    setAttributeNameNotEmpty(name !== "");
  }, [name]);

  return (
    <TabContainer isExpanded={isExpanded} onToggleExpand={state => setExpanded(state)} >
      <Show when={isExpanded}>
        <div className="flex flex-col">
          <Field title="Name"
            initValue={props.attr.name}
            onInputChange={e => setName(e.currentTarget.value)} />
          <div className="grid grid-cols-2">
            <CheckBox
              id={`static-attribute-${props.index}`}
              title="Static"
              initValue={isStatic}
              onChanges={e => setIsStatic(e.currentTarget.checked)} />
            <CheckBox
              id={`constant-attribute-${props.index}`}
              title="Constant"
              initValue={isConstant}
              onChanges={e => setIsConstant(e.currentTarget.checked)} />
          </div>
          <UMLAccessModifiersContainer
            id={`attribute-${props.index}`}
            initValue={props.attr.accessModifier}
            onChange={(mod) => setAccessModifier(mod)} />
          <Field title="Type"
            initValue={props.attr.type}
            onInputChange={e => setType(e.currentTarget.value)} />
          <Field title="Default value"
            initValue={props.attr.defaultValue}
            onInputChange={e => setDefaultValue(e.currentTarget.value)} />
          <button className="
                        py-1 w-full rounded mb-1 
                        border border-gray-200 
                        text-sm font-medium text-gray-700 dark:text-white
                        bg-gradient-to-r
                        hover:from-red-500 hover:to-red-600
                        hover:text-white hover:shadow"
            onClick={e => props.delete()}>
            Delete
          </button>
        </div>
      </Show>
      <Show when={!isExpanded}>
        <label htmlFor={`attribute-${props.index}`}
          className="
                text-sm text-gray-500 
                dark:text-gray-400 duration-300 
                scale-75 origin-[0]">
          {isAttributeNameNotEmpty ? name : "unnamed"}
        </label>
      </Show>
    </TabContainer>
  );
}