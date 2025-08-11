import { Handle, Position } from "@xyflow/react";
import { memo } from "react";
import { UMLClass, UmlToString } from "../../api/Uml";
import BreakText from "../basic/BreakText";

type UMLClassNodeProps = {
  data: UMLClass;
  isConnectable: boolean;
};

function UMLClassNode({ data, isConnectable }: UMLClassNodeProps) {

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <div className="rounded bg-white border border-stone-400">
        <div className="flex flex-col">
          <code className="p-2 text-center">
            <BreakText>
              {UmlToString(data)}
            </BreakText>
          </code>
          <hr />
          <div className="flex flex-col p-2">
            {data.attributes.map((attribute, index) => {
              return (attribute.isStatic &&
                 <code key={index} className="italic">{UmlToString(attribute)}</code>)
                 || <code key={index}>{UmlToString(attribute)}</code>
            })}
          </div>
          <hr />
          <div className="flex flex-col p-2">
            {data.methods.map((method, index) => {
              return <code key={index}>{UmlToString(method)}</code>;
            })}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </>
  );
}

export default memo(UMLClassNode);