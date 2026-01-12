'use client';

import { memo, useState } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import {
  Box,
  AlertTriangle,
  Webhook,
  Clock,
  Calendar,
  Play,
  Workflow,
  Mail,
  MessageSquare,
  Table,
  Database,
  FileText,
  Globe,
  MessageCircle,
  Github,
  CheckSquare,
  Cloud,
  CreditCard,
  Phone,
  Send,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Filter,
  Layers,
  Pause,
  Edit3,
  Code,
  Terminal,
  List,
  Lock,
  Reply,
  Circle,
  type LucideIcon,
} from 'lucide-react';
import type { N8nNodeData } from '@/lib/workflow/types';
import { CATEGORY_COLORS } from '@/lib/workflow/node-icons';
import { cn } from '@/lib/utils';

// Map icon names to actual Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Box,
  AlertTriangle,
  Webhook,
  Clock,
  Calendar,
  Play,
  Workflow,
  Mail,
  MessageSquare,
  Table,
  Database,
  FileText,
  Globe,
  MessageCircle,
  Github,
  CheckSquare,
  Cloud,
  CreditCard,
  Phone,
  Send,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Filter,
  Layers,
  Pause,
  Edit3,
  Code,
  Terminal,
  List,
  Lock,
  Reply,
  Circle,
};

// Define the full node type that React Flow expects
type N8nCustomNode = Node<N8nNodeData, 'n8nNode'>;

function N8nNodeComponent({ data, selected }: NodeProps<N8nCustomNode>): React.ReactElement {
  const [showTooltip, setShowTooltip] = useState(false);
  const colors = CATEGORY_COLORS[data.category];

  // Get icon component from map
  const IconComponent = ICON_MAP[data.icon] ?? Box;

  return (
    <div
      className={cn(
        'relative min-w-[160px] rounded-lg border-2 px-4 py-3 shadow-sm transition-all',
        'bg-card hover:shadow-md',
        colors.border,
        selected && 'ring-2 ring-primary ring-offset-2',
        data.hasWarning && 'ring-2 ring-amber-500'
      )}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-background !bg-muted-foreground"
      />

      {/* Node Content */}
      <div className="flex items-center gap-3">
        <div className={cn('rounded-md p-2', colors.iconBg)}>
          <IconComponent className={cn('h-5 w-5', colors.text)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{data.label}</p>
          <p className="truncate text-xs text-muted-foreground">{data.nodeType.split('.').pop()}</p>
        </div>
      </div>

      {/* Warning Badge */}
      {data.hasWarning && (
        <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
          <AlertTriangle className="h-3 w-3" />
        </div>
      )}

      {/* Hover Tooltip */}
      {showTooltip && data.configSummary && data.configSummary !== 'No configuration' && (
        <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
          <p className="whitespace-pre-wrap">{data.configSummary}</p>
          {data.warningMessage && <p className="mt-1 text-amber-500">{data.warningMessage}</p>}
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-background !bg-muted-foreground"
      />
    </div>
  );
}

export const N8nNode = memo(N8nNodeComponent);
