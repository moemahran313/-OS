import React, { useRef } from "react";
import {
  Blocks,
  FileText,
  ShieldAlert,
  AlertTriangle,
  Send,
  Mail,
  Database,
  Cpu,
  Play,
  UserCheck,
  Zap,
  Clock,
  Settings2,
  Trash2,
  Activity,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  PlusCircle,
  Eye,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { WorkflowNode, WorkflowEdge } from "./types";

interface CanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  onExecuteSingleNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onAddNode: (type: "trigger" | "action" | "condition") => void;

  // Canvas grid states
  zoomLevel: number;
  setZoomLevel: (z: number) => void;
  panOffset: { x: number; y: number };
  setPanOffset: (offset: { x: number; y: number }) => void;
  isPanning: boolean;
  setIsPanning: (p: boolean) => void;
  panStart: { x: number; y: number };
  setPanStart: (start: { x: number; y: number }) => void;

  // Dragging states
  draggedNodeId: string | null;
  setDraggedNodeId: (id: string | null) => void;
  dragOffset: { x: number; y: number };
  setDragOffset: (offset: { x: number; y: number }) => void;
}

// Map of icon names to lucide react components
const IconMapper: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const map: Record<string, any> = {
    Blocks,
    FileText,
    ShieldAlert,
    AlertTriangle,
    Send,
    Mail,
    Database,
    Cpu,
    Play,
    UserCheck,
    Zap,
    Clock,
    Settings2,
    Sliders,
  };
  const Comp = map[name] || HelpCircle;
  return <Comp className={className} />;
};

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  setSelectedNodeId,
  onExecuteSingleNode,
  onDeleteNode,
  onAddNode,
  zoomLevel,
  setZoomLevel,
  panOffset,
  setPanOffset,
  isPanning,
  setIsPanning,
  panStart,
  setPanStart,
  draggedNodeId,
  setDraggedNodeId,
  dragOffset,
  setDragOffset,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 0.95;
    const nextZoom = Math.min(1.5, Math.max(0.6, zoomLevel * factor));
    setZoomLevel(parseFloat(nextZoom.toFixed(2)));
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggedNodeId) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Account for zoom level and pan offset during dragging
      const xUnscaled = e.clientX - rect.left - panOffset.x;
      const yUnscaled = e.clientY - rect.top - panOffset.y;

      const newX = Math.round((xUnscaled / zoomLevel - dragOffset.x) / 10) * 10;
      const newY = Math.round((yUnscaled / zoomLevel - dragOffset.y) / 10) * 10;

      // Update position of the node inside the parent state
      const nodeIndex = nodes.findIndex((n) => n.id === draggedNodeId);
      if (nodeIndex !== -1) {
        nodes[nodeIndex].x = Math.max(20, Math.min(3000, newX));
        nodes[nodeIndex].y = Math.max(20, Math.min(2000, newY));
      }
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  // Node drag start
  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggedNodeId(nodeId);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: (e.clientX - rect.left) / zoomLevel,
      y: (e.clientY - rect.top) / zoomLevel,
    });
  };

  // Cubic Bezier link path calculation
  const getCubicBezierPath = (fromX: number, fromY: number, toX: number, toY: number) => {
    const nodeWidth = 220;
    const nodeHeight = 84;

    // Right port of source node
    const startX = fromX + nodeWidth;
    const startY = fromY + nodeHeight / 2;

    // Left port of target node
    const endX = toX;
    const endY = toY + nodeHeight / 2;

    // Control points for bezier curve
    const controlOffset = Math.max(80, Math.abs(endX - startX) * 0.4);
    const cp1X = startX + controlOffset;
    const cp1Y = startY;
    const cp2X = endX - controlOffset;
    const cp2Y = endY;

    return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
  };

  // Node type colors and styling
  const getNodeStyles = (type: "trigger" | "action" | "condition", isSelected: boolean) => {
    let colors = {
      accent: "bg-indigo-600 border-indigo-200 text-indigo-600",
      bg: "bg-indigo-50/40",
      tag: "bg-indigo-100/80 text-indigo-700",
      glow: "shadow-indigo-500/10",
    };

    if (type === "trigger") {
      colors = {
        accent: "bg-emerald-600 border-emerald-200 text-emerald-600",
        bg: "bg-emerald-50/40",
        tag: "bg-emerald-100/80 text-emerald-700",
        glow: "shadow-emerald-500/10",
      };
    } else if (type === "condition") {
      colors = {
        accent: "bg-amber-600 border-amber-200 text-amber-600",
        bg: "bg-amber-50/40",
        tag: "bg-amber-100/80 text-amber-700",
        glow: "shadow-amber-500/10",
      };
    }

    return {
      container: `absolute w-[220px] bg-white rounded-2xl border-2 transition-all shadow-md select-none group cursor-grab active:cursor-grabbing ${
        isSelected
          ? "border-zinc-900 shadow-xl scale-[1.02]"
          : "border-zinc-150 hover:border-zinc-300 hover:shadow-lg"
      }`,
      tag: `text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${colors.tag}`,
      badge: `p-2 rounded-xl text-white ${type === "trigger" ? "bg-emerald-600" : type === "condition" ? "bg-amber-500" : "bg-indigo-600"}`,
    };
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 mr-2">إضافة عقدة:</span>
          <button
            onClick={() => onAddNode("trigger")}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-150 hover:bg-emerald-100 text-[10px] font-black rounded-xl flex items-center gap-1 cursor-pointer transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>حافز (Trigger)</span>
          </button>
          <button
            onClick={() => onAddNode("action")}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-150 hover:bg-indigo-100 text-[10px] font-black rounded-xl flex items-center gap-1 cursor-pointer transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>إجراء (Action)</span>
          </button>
          <button
            onClick={() => onAddNode("condition")}
            className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-150 hover:bg-amber-100 text-[10px] font-black rounded-xl flex items-center gap-1 cursor-pointer transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>شرط (Condition)</span>
          </button>
        </div>

        {/* Zoom display controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.1))}
            className="p-1.5 hover:bg-zinc-100 text-zinc-600 rounded-lg text-xs font-black"
          >
            -
          </button>
          <span className="text-[10px] font-black text-zinc-500 min-w-[40px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
            className="p-1.5 hover:bg-zinc-100 text-zinc-600 rounded-lg text-xs font-black"
          >
            +
          </button>
        </div>
      </div>

      {/* Infinite Canvas */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-[520px] bg-zinc-50 border border-zinc-200 rounded-3xl relative overflow-hidden select-none"
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
      >
        {/* Radial grid pattern background */}
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-75"
          style={{
            backgroundImage: "radial-gradient(#e4e4e7 1.5px, transparent 1.5px)",
            backgroundSize: `${24 * zoomLevel}px ${24 * zoomLevel}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
          }}
        />

        {/* Zoomed & Panned Workspace wrapper */}
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          }}
        >
          {/* SVG Vector Connections Line Renderer */}
          <svg className="absolute inset-0 pointer-events-none overflow-visible w-[5000px] h-[3000px]">
            <g>
              {edges.map((edge, idx) => {
                const fromNode = nodes.find((n) => n.id === edge.from);
                const toNode = nodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const pathString = getCubicBezierPath(fromNode.x, fromNode.y, toNode.x, toNode.y);
                const isEdgeRunning = fromNode.status === "running" || toNode.status === "running";

                return (
                  <g key={`${edge.from}-${edge.to}-${idx}`}>
                    {/* Shadow halo behind path */}
                    <path d={pathString} fill="none" stroke="white" strokeWidth={6} opacity={0.8} />
                    {/* Core connection curve */}
                    <path
                      d={pathString}
                      fill="none"
                      stroke={isEdgeRunning ? "#6366f1" : "#d4d4d8"}
                      strokeWidth={2.5}
                      className={isEdgeRunning ? "animate-[dash_1s_linear_infinite]" : ""}
                      strokeDasharray={isEdgeRunning ? "6, 6" : "none"}
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Render interactive Nodes */}
          {nodes.map((node) => {
            const styles = getNodeStyles(node.type, selectedNodeId === node.id);
            const isNodeRunning = node.status === "running";

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                className={styles.container}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                }}
              >
                {/* Status Indicator pulse ring on running node */}
                {isNodeRunning && (
                  <span className="absolute -inset-1.5 rounded-2xl border-2 border-indigo-400 animate-ping opacity-60" />
                )}

                <div className="p-4 flex gap-3 relative">
                  {/* Left node input port handle */}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-zinc-200 border border-white rounded-full pointer-events-none group-hover:bg-zinc-400 transition-colors" />

                  {/* Icon badge */}
                  <div className={styles.badge}>
                    <IconMapper name={node.iconName} className="w-4 h-4" />
                  </div>

                  {/* Text details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={styles.tag}>
                        {node.type === "trigger"
                          ? "حافز"
                          : node.type === "condition"
                            ? "شرط"
                            : "إجراء"}
                      </span>
                      {/* Interactive running indicators */}
                      {node.status !== "idle" && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            node.status === "completed"
                              ? "bg-emerald-500"
                              : node.status === "running"
                                ? "bg-indigo-500"
                                : node.status === "warning"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                          }`}
                        />
                      )}
                    </div>
                    <h4 className="text-xs font-black text-zinc-900 mt-1 truncate" dir="auto">
                      {node.nameAr || node.name}
                    </h4>
                    <p
                      className="text-[10px] text-zinc-400 font-semibold truncate mt-0.5"
                      dir="auto"
                    >
                      {node.descAr || node.desc}
                    </p>
                  </div>

                  {/* Right node output port handle */}
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-zinc-200 border border-white rounded-full pointer-events-none group-hover:bg-zinc-400 transition-colors" />
                </div>

                {/* Node micro actions overlay on hover */}
                <div className="absolute bottom-full right-2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-zinc-900/95 text-white px-2 py-1 rounded-xl shadow-lg border border-zinc-800 pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExecuteSingleNode(node.id);
                    }}
                    title="تشغيل تجريبي منفرد"
                    className="p-1 hover:text-emerald-400 rounded transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNode(node.id);
                    }}
                    title="حذف العقدة"
                    className="p-1 hover:text-rose-400 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
