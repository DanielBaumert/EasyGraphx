import { useEffect, useState } from "react";
import { Field, IconDropDownArrow, LabelSmall, Show } from "..";
import { UMLParameter } from "../../api/Uml";
import IconCrossDelete from "../basic/IconCrossDelete";


type UMLParameterContainerProps = {
  umlParameter: UMLParameter;
  updateParameter: (umlParameter: UMLParameter) => void;
};

export default (props: UMLParameterContainerProps) => {

  const [isExpanded, setExpanded] = useState(false);

  const [name, setName] = useState(props.umlParameter.name);
  const [type, setType] = useState(props.umlParameter.type);

  useEffect(() => {
    updateParameter({ 
      name: name,
      type: type
    });
  }, [name, type]);

  function updateParameter(newData: Partial<UMLParameter>) {
    const updatedParameter = { ...props.umlParameter, ...newData };
    props.updateParameter(updatedParameter);
  }

  return (
    <div className={`relative rounded ${isExpanded && "px-1 pb-1 pt-4" || 'p-1'} border-2 border-white`}>
      <div className={`absolute flex flex-row items-center ${!isExpanded && "h-full top-0" || "top-1"} right-1 z-20`}>
        <div className="group dark:hover:bg-[#333333] p-1" 
        // onClick={() => props.popParameter()}
        >
          <IconCrossDelete />
        </div>
        <div 
          className={`group dark:hover:bg-[#333333] ${isExpanded && 'rotate-180'}`} 
          onClick={() => setExpanded(!isExpanded)}>
          <IconDropDownArrow />
        </div>
      </div>
      <Show when={isExpanded}>
        <Field
          title="Name"
          initValue={name}
          onInputChange={(e) => setName(e.target.value)} />
        <Field
          title="Type"
          initValue={type}
          onInputChange={(e) => setType(e.target.value)} />
      </Show>
      <Show when={!isExpanded}>
        <LabelSmall title={name === "" ? "Unnamed" : name} />
      </Show>
    </div>);
}