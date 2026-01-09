/**
 * Template system for non-technical users to deploy n8n workflows.
 */

export type TemplateCategory = 'marketing' | 'ops' | 'sales';
export type TemplateComplexity = 'simple' | 'medium' | 'sophisticated';
export type FieldType = 'text' | 'select' | 'number' | 'channel' | 'email';

/**
 * A single configurable field in the wizard.
 */
export interface TemplateField {
  /** Unique identifier for this field */
  id: string;
  /** Field input type */
  type: FieldType;
  /** Human-readable label shown to user */
  label: string;
  /** Placeholder or helper text */
  placeholder: string;
  /** Whether this field is required */
  required: boolean;
  /** Options for select fields */
  options?: Array<{ value: string; label: string }>;
  /** Default value */
  defaultValue?: string | number;
  /** Which n8n node this configures */
  nodeId: string;
  /** Path in node parameters (dot notation) */
  paramPath: string;
}

/**
 * A single step in the wizard flow.
 */
export interface TemplateStep {
  /** Unique identifier for this step */
  id: string;
  /** Step title shown in wizard */
  title: string;
  /** Step description/instructions */
  description: string;
  /** Fields to configure in this step */
  fields: TemplateField[];
}

/**
 * Visual node representation for preview.
 */
export interface WorkflowNode {
  /** Node ID matching the n8n workflow */
  id: string;
  /** Display name for preview */
  name: string;
  /** Icon identifier */
  icon: string;
  /** Plain language description */
  description: string;
}

/**
 * A complete template definition.
 */
export interface Template {
  /** Unique template identifier */
  id: string;
  /** Template name */
  name: string;
  /** Short tagline */
  tagline: string;
  /** Full description */
  description: string;
  /** Category for filtering */
  category: TemplateCategory;
  /** Complexity indicator */
  complexity: TemplateComplexity;
  /** Apps/services used (for icons) */
  apps: string[];
  /** Estimated setup time in minutes */
  setupTime: number;
  /** Steps in the wizard */
  steps: TemplateStep[];
  /** Visual nodes for preview */
  previewNodes: WorkflowNode[];
  /** Pre-built n8n workflow JSON (with placeholders) */
  workflow: N8nWorkflow;
}

/**
 * n8n workflow structure.
 */
export interface N8nWorkflow {
  name: string;
  nodes: N8nNode[];
  connections: Record<string, N8nConnection>;
  settings?: Record<string, unknown>;
}

export interface N8nNode {
  id?: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, unknown>;
  credentials?: Record<string, unknown>;
}

export interface N8nConnection {
  main: Array<Array<{ node: string; type: string; index: number }>>;
}

/**
 * Wizard state during template configuration.
 */
export interface WizardState {
  template: Template;
  currentStep: number;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  isDeploying: boolean;
  deployResult?: {
    success: boolean;
    workflowId?: string;
    error?: string;
  };
}
