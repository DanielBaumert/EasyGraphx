import {
  MarkerType, useEdgesState, useNodesState,
  type Node,
} from "@xyflow/react";
import { UMLAccessModifiers, UMLAttribute, UMLClass } from "./Uml";
import { useState } from "react";

type BasicNode<T> = {
  id: string;
  type: string;
  position?: { x: number; y: number };
  data: T;
}

type NodesTypes = BasicNode<UMLClass>

export const initialNodes: NodesTypes[] = [
  {
    id: 'n1', type: 'class',
    position: { x: 0, y: 0 },
    data: {
      __type__: 'class',
      name: 'Node 1',
      attributes: [
        { __type__: 'attribute', name: 'attribute1', type: 'string', accessModifier: UMLAccessModifiers.Public, isConstant: false },
        { __type__: 'attribute', name: 'attribute2', type: 'number', accessModifier: UMLAccessModifiers.Private, isConstant: true }
      ],
      methods: [],
      property: 'property1',
      isAbstract: false,
    }
  }, {
    id: 'n2', type: 'class',
    position: { x: 0, y: 100 },
    data: {
      __type__: 'class',
      name: 'Node 2',
      attributes: [
        { __type__: 'attribute', name: 'attribute3', type: 'boolean', defaultValue: "true", accessModifier: UMLAccessModifiers.Protected, isConstant: false },
        { __type__: 'attribute', name: 'attribute4', type: 'string', accessModifier: UMLAccessModifiers.Internal, isConstant: true }
      ],
      methods: [
        { __type__: 'method', name: 'method1', returnType: 'void', parameters: [] },
        { __type__: 'method', name: 'method2', returnType: 'string', parameters: [{ __type__: 'parameter', name: 'param1', type: 'number' }] }
      ],
      property: 'property2',
      isAbstract: true,
    }
  },
];

export const initialEdges = [{
  id: 'n1-n2',
  source: 'n1',
  target: 'n2',
  markerEnd: { type: MarkerType.ArrowClosed },
  type: 'floating'
}];



