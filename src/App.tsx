import { useCallback, useState } from 'react'
import '@xyflow/react/dist/style.css';
import {
  Background, ColorMode, MarkerType, MiniMap, ReactFlow, useEdgesState, useNodesState, useReactFlow,
  type Node,
} from '@xyflow/react';
import UMLClassNode from './components/reactflow/ClassView';
import FloatingEdge from './components/reactflow/FloatingEdge';
import FloatingConnectionLine from './components/reactflow/FloatingConnectionLine';
import { UMLAccessModifiers, UMLAttribute, UMLClass } from './api/Uml';
import { UMLClassComponent } from './components';

type BasicNode<T> = {
  id: string;
  type: string;
  position?: { x: number; y: number };
  data: T;
}

type NodesTypes = BasicNode<UMLClass>

const initialNodes: NodesTypes[] = [
  {
    id: 'n1', type: 'class',
    position: { x: 0, y: 0 },
    data: new UMLClass(
      {
        name: 'Node 1',
        attributes: [
          new UMLAttribute({ name: 'attribute1', type: 'string', accessModifier: UMLAccessModifiers.Public, isConstant: false }),
          new UMLAttribute({ name: 'attribute2', type: 'number', accessModifier: UMLAccessModifiers.Private, isConstant: true })
        ],
        methods: [],
        property: 'property1',
        isAbstract: false,
      })
  }, {
    id: 'n2', type: 'class',
    position: { x: 0, y: 100 },
    data: new UMLClass(
      {
        name: 'Node 2',
        attributes: [
          new UMLAttribute({ name: 'attribute3', type: 'boolean', defaultValue: "true", accessModifier: UMLAccessModifiers.Protected, isConstant: false }),
          new UMLAttribute({ name: 'attribute4', type: 'string', accessModifier: UMLAccessModifiers.Internal, isConstant: true })
        ],
        methods: [],
        property: 'property2',
        isAbstract: true,
      })
  },
];

const initialEdges = [{
  id: 'n1-n2',
  source: 'n1',
  target: 'n2',
  markerEnd: { type: MarkerType.ArrowClosed },
  type: 'floating'
}];


const snapGrid: [number, number] = [20, 20];
const nodeTypes = {
  class: UMLClassNode,
};
const edgeTypes = {
  floating: FloatingEdge,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [colorMode, setColorMode] = useState<ColorMode>('dark');

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onNodeClick = useCallback((e: MouseEvent, node: Node) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Node clicked:', node);
    setSelectedNode(node);
    
  }, []);

  const flowClick = useCallback((event) => {
    if (selectedNode) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const onConnect = useCallback((_: MouseEvent, node: Node) => {

  }, []);

  return (
    <div className="floating-edges" style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        onClick={flowClick}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        snapToGrid={true}
        snapGrid={snapGrid}
        nodeTypes={nodeTypes}
        colorMode={colorMode}
        edgeTypes={edgeTypes}
        connectionLineComponent={FloatingConnectionLine}
        fitView
        maxZoom={1}
        minZoom={0.1}
      >
        <Background />
        <MiniMap />
      </ReactFlow>
      <UMLClassComponent selectedClass={(selectedNode?.data ?? undefined) as UMLClass | undefined} />
    </div>
  )
}

export default App
