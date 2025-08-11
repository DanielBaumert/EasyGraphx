import { useCallback, useState, useEffect } from 'react'
import '@xyflow/react/dist/style.css';
import {
  Background, ColorMode, MiniMap, NodeTypes, ReactFlow, 
  useEdgesState, 
  useNodesState, 
  type Node,
} from '@xyflow/react';
import UMLClassNode from './components/reactflow/ClassView';
import FloatingEdge from './components/reactflow/FloatingEdge';
import FloatingConnectionLine from './components/reactflow/FloatingConnectionLine';
import { UMLClass } from './api/Uml';
import { UMLClassComponent } from './components';
import { initialEdges, initialNodes } from './api/Storage';




function App() {

  const snapGrid: [number, number] = [20, 20];
  const nodeTypes = {
    class: UMLClassNode,
  };
  const edgeTypes = {
    floating: FloatingEdge,
  };


  const [colorMode, setColorMode] = useState<ColorMode>('dark');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<UMLClass>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [selectedNode, setSelectedNode] = useState<Node<UMLClass> | undefined>(undefined);

  const onNodeClick = (e: MouseEvent, node: Node<UMLClass>) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNode(node);
    console.log('Node clicked:', node);
  };

  const flowClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedNode) {
      setSelectedNode(undefined);
    }
  }, [selectedNode]);

  /**  */
  /** */

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
      {selectedNode && (
        <>
        <UMLClassComponent
          key={selectedNode.id} 
          node={selectedNode}
          setNodes={setNodes}
        />
        </>
      )}
    </div>
  )
}

export default App
