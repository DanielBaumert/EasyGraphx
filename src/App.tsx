import { useCallback, useState } from 'react'
import '@xyflow/react/dist/style.css';
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, ColorMode, Controls, MarkerType, MiniMap, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
import UMLClassNode from './components/reactflow/ClassView';
import FloatingEdge from './components/reactflow/FloatingEdge';
import FloatingConnectionLine from './components/reactflow/FloatingConnectionLine';

const initialNodes = [
  { id: 'n1', type:'classNode', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', type:'classNode', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];

const initialEdges = [{ 
  id: 'n1-n2', 
  source: 'n1', 
  target: 'n2',
  markerEnd: { type: MarkerType.ArrowClosed },
  type: 'floating' 
}];
const snapGrid : [number, number] = [20, 20];
const nodeTypes = {
  classNode: UMLClassNode,
};
const edgeTypes = {
  floating: FloatingEdge,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [colorMode, setColorMode] = useState<ColorMode>('dark');

  const [selectedNode, setSelectedNode] = useState<>(null);

  const onNodeClick = useCallback((event, node) => {
    console.log('Node clicked:', node);
  }, []);

  const onConnect = useCallback((_: MouseEvent, node: Node) => {

  }, []);

  return ( 
    <div className="floating-edges" style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onConnect={onConnect}
        snapToGrid={true}
        snapGrid={snapGrid}
        nodeTypes={nodeTypes}
        colorMode={colorMode}
        edgeTypes={edgeTypes}
        connectionLineComponent={FloatingConnectionLine}
        fitView
      >
        <Background />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}

export default App
