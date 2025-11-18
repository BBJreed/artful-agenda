import React, { useState, useRef } from 'react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  title: string;
  description: string;
  position: { x: number; y: number };
  config: any;
}

interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  enabled: boolean;
}

const WorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Morning Routine',
      description: 'Automated morning routine workflow',
      nodes: [
        {
          id: 'n1',
          type: 'trigger',
          title: 'Time Trigger',
          description: 'Triggers at 7:00 AM',
          position: { x: 100, y: 100 },
          config: { time: '07:00' }
        },
        {
          id: 'n2',
          type: 'action',
          title: 'Create Event',
          description: 'Create "Morning Exercise" event',
          position: { x: 300, y: 100 },
          config: { title: 'Morning Exercise', duration: 30 }
        }
      ],
      connections: [
        { id: 'c1', sourceNodeId: 'n1', targetNodeId: 'n2' }
      ],
      enabled: true
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(workflows[0]);
  const [draggingNode, setDraggingNode] = useState<{ nodeId: string; offsetX: number; offsetY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const nodeTypes = [
    { type: 'trigger', title: 'Trigger', color: '#4CAF50' },
    { type: 'action', title: 'Action', color: '#2196F3' },
    { type: 'condition', title: 'Condition', color: '#FF9800' },
    { type: 'delay', title: 'Delay', color: '#9C27B0' }
  ];

  const handleNodeDragStart = (nodeId: string, e: React.MouseEvent) => {
    if (!selectedWorkflow) return;
    
    const node = selectedWorkflow.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDraggingNode({
      nodeId,
      offsetX: e.clientX - rect.left - node.position.x,
      offsetY: e.clientY - rect.top - node.position.y
    });
  };

  const handleNodeDrag = (e: React.MouseEvent) => {
    if (!draggingNode || !selectedWorkflow || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - draggingNode.offsetX;
    const y = e.clientY - rect.top - draggingNode.offsetY;
    
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id === selectedWorkflow.id) {
        return {
          ...workflow,
          nodes: workflow.nodes.map(node => 
            node.id === draggingNode.nodeId 
              ? { ...node, position: { x, y } } 
              : node
          )
        };
      }
      return workflow;
    }));
    
    if (selectedWorkflow.id === selectedWorkflow.id) {
      setSelectedWorkflow({
        ...selectedWorkflow,
        nodes: selectedWorkflow.nodes.map(node => 
          node.id === draggingNode.nodeId 
            ? { ...node, position: { x, y } } 
            : node
        )
      });
    }
  };

  const handleNodeDragEnd = () => {
    setDraggingNode(null);
  };

  const addNode = (type: string) => {
    if (!selectedWorkflow) return;
    
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: type as any,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      description: `Description for ${type} node`,
      position: { x: 200, y: 200 },
      config: {}
    };
    
    const updatedWorkflow = {
      ...selectedWorkflow,
      nodes: [...selectedWorkflow.nodes, newNode]
    };
    
    setWorkflows(prev => prev.map(w => 
      w.id === selectedWorkflow.id ? updatedWorkflow : w
    ));
    
    setSelectedWorkflow(updatedWorkflow);
  };

  const deleteNode = (nodeId: string) => {
    if (!selectedWorkflow) return;
    
    const updatedWorkflow = {
      ...selectedWorkflow,
      nodes: selectedWorkflow.nodes.filter(node => node.id !== nodeId),
      connections: selectedWorkflow.connections.filter(
        conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      )
    };
    
    setWorkflows(prev => prev.map(w => 
      w.id === selectedWorkflow.id ? updatedWorkflow : w
    ));
    
    setSelectedWorkflow(updatedWorkflow);
  };

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, enabled: !workflow.enabled } 
        : workflow
    ));
    
    if (selectedWorkflow && selectedWorkflow.id === workflowId) {
      setSelectedWorkflow({ 
        ...selectedWorkflow, 
        enabled: !selectedWorkflow.enabled 
      });
    }
  };

  const createNewWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: 'New Workflow',
      description: 'Description for new workflow',
      nodes: [],
      connections: [],
      enabled: false
    };
    
    setWorkflows(prev => [...prev, newWorkflow]);
    setSelectedWorkflow(newWorkflow);
  };

  return (
    <div className="workflow-builder">
      <div className="toolbar">
        <h2>Workflow Builder</h2>
        <button onClick={createNewWorkflow}>New Workflow</button>
      </div>
      
      <div className="workflow-list">
        <h3>Workflows</h3>
        {workflows.map(workflow => (
          <div 
            key={workflow.id} 
            className={`workflow-item ${selectedWorkflow?.id === workflow.id ? 'selected' : ''}`}
            onClick={() => setSelectedWorkflow(workflow)}
          >
            <div className="workflow-info">
              <h4>{workflow.name}</h4>
              <p>{workflow.description}</p>
            </div>
            <div className="workflow-actions">
              <button 
                className={workflow.enabled ? 'enabled' : 'disabled'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWorkflow(workflow.id);
                }}
              >
                {workflow.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {selectedWorkflow && (
        <div className="workflow-editor">
          <div className="node-palette">
            <h3>Nodes</h3>
            {nodeTypes.map(nodeType => (
              <div 
                key={nodeType.type}
                className="node-type"
                style={{ borderLeftColor: nodeType.color }}
                onClick={() => addNode(nodeType.type)}
              >
                {nodeType.title}
              </div>
            ))}
          </div>
          
          <div 
            className="canvas"
            ref={canvasRef}
            onMouseMove={handleNodeDrag}
            onMouseUp={handleNodeDragEnd}
            onMouseLeave={handleNodeDragEnd}
          >
            {selectedWorkflow.nodes.map(node => {
              const nodeType = nodeTypes.find(nt => nt.type === node.type);
              return (
                <div
                  key={node.id}
                  className={`node node-${node.type}`}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    borderLeftColor: nodeType?.color || '#999'
                  }}
                  onMouseDown={(e) => handleNodeDragStart(node.id, e)}
                >
                  <div className="node-header">
                    <h4>{node.title}</h4>
                    <button 
                      className="delete-node"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="node-description">
                    {node.description}
                  </div>
                </div>
              );
            })}
            
            <svg className="connections">
              {selectedWorkflow.connections.map(connection => {
                const sourceNode = selectedWorkflow.nodes.find(n => n.id === connection.sourceNodeId);
                const targetNode = selectedWorkflow.nodes.find(n => n.id === connection.targetNodeId);
                
                if (!sourceNode || !targetNode) return null;
                
                return (
                  <line
                    key={connection.id}
                    x1={sourceNode.position.x + 100}
                    y1={sourceNode.position.y + 30}
                    x2={targetNode.position.x}
                    y2={targetNode.position.y + 30}
                    stroke="#666"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default WorkflowBuilder;