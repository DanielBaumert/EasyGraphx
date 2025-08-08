import { Handle, Position } from "@xyflow/react";
import { memo } from "react";
import { UMLClass } from "../../api/Uml";

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
      <div className="shadow-md rounded-md bg-white border-1 border-stone-400">
        <div className="flex flex-col">
          <div className="p-2">
            <div></div>
            {(data.isAbstract ?? false)
              ? <i>{data.name}</i>
              : data.name}
            <div></div>
          </div>
          <hr />
          <div className="p-2">
            <div>Method</div>
          </div>
          <hr />
          <div className="p-2">
            <div>Method</div>
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