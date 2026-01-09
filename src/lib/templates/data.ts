import type { Template } from './types';

/**
 * Template 1: Lead Scoring & Routing
 *
 * When a form is submitted:
 * 1. Score the lead based on data
 * 2. If score > threshold, alert sales on Slack
 * 3. Otherwise, add to nurture campaign
 */
export const leadScoringTemplate: Template = {
  id: 'lead-scoring',
  name: 'Lead Scoring & Routing',
  tagline: 'Automatically qualify and route leads to your sales team',
  description:
    'Score incoming leads based on their form responses and company data. High-value leads get routed to sales via Slack, while others enter a nurture sequence.',
  category: 'sales',
  complexity: 'sophisticated',
  apps: ['webhook', 'slack', 'airtable'],
  setupTime: 5,
  steps: [
    {
      id: 'trigger',
      title: 'Set Up Your Trigger',
      description: 'This workflow will start when new data arrives at a webhook URL.',
      fields: [
        {
          id: 'webhookPath',
          type: 'text',
          label: 'Webhook Path',
          placeholder: 'e.g., lead-intake',
          required: true,
          defaultValue: 'lead-intake',
          nodeId: 'webhook',
          paramPath: 'path',
        },
      ],
    },
    {
      id: 'scoring',
      title: 'Configure Lead Scoring',
      description: 'Set the threshold for what counts as a qualified lead.',
      fields: [
        {
          id: 'scoreThreshold',
          type: 'number',
          label: 'Minimum Score for Sales Alert',
          placeholder: '70',
          required: true,
          defaultValue: 70,
          nodeId: 'if',
          paramPath: 'conditions.number[0].value2',
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Set Up Notifications',
      description: 'Where should we notify your sales team?',
      fields: [
        {
          id: 'slackChannel',
          type: 'text',
          label: 'Slack Channel',
          placeholder: '#sales-leads',
          required: true,
          defaultValue: '#sales-leads',
          nodeId: 'slack',
          paramPath: 'channel',
        },
      ],
    },
  ],
  previewNodes: [
    {
      id: 'webhook',
      name: 'Form Submitted',
      icon: 'webhook',
      description: 'Starts when a new lead submits a form',
    },
    {
      id: 'set',
      name: 'Calculate Score',
      icon: 'calculator',
      description: 'Scores the lead based on their data',
    },
    {
      id: 'if',
      name: 'Check Score',
      icon: 'branch',
      description: 'Routes based on lead quality',
    },
    {
      id: 'slack',
      name: 'Alert Sales',
      icon: 'slack',
      description: 'Sends notification to sales team',
    },
  ],
  workflow: {
    name: 'Lead Scoring & Routing',
    nodes: [
      {
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          httpMethod: 'POST',
          path: '{{webhookPath}}',
          responseMode: 'onReceived',
          responseData: 'allEntries',
        },
      },
      {
        name: 'Calculate Score',
        type: 'n8n-nodes-base.set',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          keepOnlySet: false,
          values: {
            number: [
              {
                name: 'leadScore',
                value:
                  '={{ ($json.company ? 30 : 0) + ($json.email?.includes("@gmail") ? 10 : 25) + ($json.budget > 1000 ? 35 : 15) }}',
              },
            ],
          },
        },
      },
      {
        name: 'Check Score',
        type: 'n8n-nodes-base.if',
        typeVersion: 1,
        position: [650, 300],
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{$json.leadScore}}',
                operation: 'largerEqual',
                value2: '{{scoreThreshold}}',
              },
            ],
          },
        },
      },
      {
        name: 'Alert Sales',
        type: 'n8n-nodes-base.slack',
        typeVersion: 1,
        position: [850, 200],
        parameters: {
          channel: '{{slackChannel}}',
          text: '=:fire: *Hot Lead Alert*\n\nName: {{$json.name}}\nEmail: {{$json.email}}\nCompany: {{$json.company}}\nScore: {{$json.leadScore}}/100\n\n_Respond within 5 minutes for best results_',
          attachments: [],
          otherOptions: {},
        },
      },
      {
        name: 'Add to Nurture',
        type: 'n8n-nodes-base.set',
        typeVersion: 1,
        position: [850, 400],
        parameters: {
          keepOnlySet: false,
          values: {
            string: [
              {
                name: 'status',
                value: 'nurture',
              },
            ],
          },
        },
      },
    ],
    connections: {
      Webhook: {
        main: [[{ node: 'Calculate Score', type: 'main', index: 0 }]],
      },
      'Calculate Score': {
        main: [[{ node: 'Check Score', type: 'main', index: 0 }]],
      },
      'Check Score': {
        main: [
          [{ node: 'Alert Sales', type: 'main', index: 0 }],
          [{ node: 'Add to Nurture', type: 'main', index: 0 }],
        ],
      },
    },
  },
};

/**
 * Template 2: Customer Health Monitor
 *
 * Daily check on customer health:
 * 1. Fetch customer data
 * 2. Analyze for churn signals
 * 3. Alert CSM if at-risk
 */
export const customerHealthTemplate: Template = {
  id: 'customer-health',
  name: 'Customer Health Monitor',
  tagline: 'Get alerted when customers show churn signals',
  description:
    'Automatically monitor customer engagement and get Slack alerts when a customer shows signs of churning. Stay proactive with customer success.',
  category: 'ops',
  complexity: 'sophisticated',
  apps: ['schedule', 'http', 'slack'],
  setupTime: 5,
  steps: [
    {
      id: 'schedule',
      title: 'Set Check Frequency',
      description: 'How often should we check customer health?',
      fields: [
        {
          id: 'checkHour',
          type: 'select',
          label: 'Daily Check Time',
          placeholder: 'Select time',
          required: true,
          defaultValue: '9',
          options: [
            { value: '6', label: '6:00 AM' },
            { value: '9', label: '9:00 AM' },
            { value: '12', label: '12:00 PM' },
            { value: '18', label: '6:00 PM' },
          ],
          nodeId: 'cron',
          paramPath: 'triggerTimes.item[0].hour',
        },
      ],
    },
    {
      id: 'data',
      title: 'Connect Your Data',
      description: 'Where should we fetch customer data from?',
      fields: [
        {
          id: 'apiUrl',
          type: 'text',
          label: 'Customer Data API URL',
          placeholder: 'https://api.yourapp.com/customers',
          required: true,
          nodeId: 'http',
          paramPath: 'url',
        },
      ],
    },
    {
      id: 'alerts',
      title: 'Configure Alerts',
      description: 'Where should we send churn risk alerts?',
      fields: [
        {
          id: 'alertChannel',
          type: 'text',
          label: 'Slack Channel for Alerts',
          placeholder: '#customer-success',
          required: true,
          defaultValue: '#customer-success',
          nodeId: 'slack',
          paramPath: 'channel',
        },
        {
          id: 'daysInactive',
          type: 'number',
          label: 'Days Inactive = At Risk',
          placeholder: '14',
          required: true,
          defaultValue: 14,
          nodeId: 'if',
          paramPath: 'conditions.number[0].value2',
        },
      ],
    },
  ],
  previewNodes: [
    {
      id: 'cron',
      name: 'Daily Check',
      icon: 'clock',
      description: 'Runs every day at your chosen time',
    },
    {
      id: 'http',
      name: 'Fetch Customers',
      icon: 'database',
      description: 'Gets customer data from your API',
    },
    {
      id: 'if',
      name: 'Check Activity',
      icon: 'branch',
      description: 'Identifies inactive customers',
    },
    {
      id: 'slack',
      name: 'Alert Team',
      icon: 'slack',
      description: 'Notifies customer success team',
    },
  ],
  workflow: {
    name: 'Customer Health Monitor',
    nodes: [
      {
        name: 'Daily Check',
        type: 'n8n-nodes-base.cron',
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          triggerTimes: {
            item: [
              {
                mode: 'everyDay',
                hour: '{{checkHour}}',
              },
            ],
          },
        },
      },
      {
        name: 'Fetch Customers',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          url: '{{apiUrl}}',
          method: 'GET',
          options: {
            splitIntoItems: true,
          },
        },
      },
      {
        name: 'Check Activity',
        type: 'n8n-nodes-base.if',
        typeVersion: 1,
        position: [650, 300],
        parameters: {
          conditions: {
            number: [
              {
                value1: '={{$json.daysSinceLastActivity}}',
                operation: 'larger',
                value2: '{{daysInactive}}',
              },
            ],
          },
        },
      },
      {
        name: 'Alert Team',
        type: 'n8n-nodes-base.slack',
        typeVersion: 1,
        position: [850, 200],
        parameters: {
          channel: '{{alertChannel}}',
          text: '=:warning: *Churn Risk Detected*\n\nCustomer: {{$json.name}}\nLast Active: {{$json.daysSinceLastActivity}} days ago\nMRR: ${{$json.mrr}}\n\n_Please reach out today_',
        },
      },
    ],
    connections: {
      'Daily Check': {
        main: [[{ node: 'Fetch Customers', type: 'main', index: 0 }]],
      },
      'Fetch Customers': {
        main: [[{ node: 'Check Activity', type: 'main', index: 0 }]],
      },
      'Check Activity': {
        main: [[{ node: 'Alert Team', type: 'main', index: 0 }], []],
      },
    },
  },
};

/**
 * Template 3: Content Distribution Pipeline
 *
 * When new content is published:
 * 1. Detect new blog post
 * 2. Generate social posts with AI
 * 3. Notify team on Slack
 */
export const contentDistributionTemplate: Template = {
  id: 'content-distribution',
  name: 'Content Distribution Pipeline',
  tagline: 'Automatically promote new content across channels',
  description:
    'When you publish a new blog post, automatically generate social media posts using AI and notify your marketing team on Slack.',
  category: 'marketing',
  complexity: 'sophisticated',
  apps: ['rss', 'openai', 'slack'],
  setupTime: 5,
  steps: [
    {
      id: 'source',
      title: 'Connect Your Blog',
      description: 'Where should we monitor for new content?',
      fields: [
        {
          id: 'rssFeed',
          type: 'text',
          label: 'Blog RSS Feed URL',
          placeholder: 'https://yourblog.com/feed',
          required: true,
          nodeId: 'rss',
          paramPath: 'url',
        },
      ],
    },
    {
      id: 'ai',
      title: 'Configure AI Generation',
      description: 'How should we generate social posts?',
      fields: [
        {
          id: 'tone',
          type: 'select',
          label: 'Social Post Tone',
          placeholder: 'Select tone',
          required: true,
          defaultValue: 'professional',
          options: [
            { value: 'professional', label: 'Professional' },
            { value: 'casual', label: 'Casual & Friendly' },
            { value: 'witty', label: 'Witty & Engaging' },
            { value: 'educational', label: 'Educational' },
          ],
          nodeId: 'openai',
          paramPath: 'tone',
        },
      ],
    },
    {
      id: 'notify',
      title: 'Notify Your Team',
      description: 'Where should we send the generated posts for review?',
      fields: [
        {
          id: 'marketingChannel',
          type: 'text',
          label: 'Slack Channel',
          placeholder: '#marketing',
          required: true,
          defaultValue: '#marketing',
          nodeId: 'slack',
          paramPath: 'channel',
        },
      ],
    },
  ],
  previewNodes: [
    {
      id: 'rss',
      name: 'New Blog Post',
      icon: 'rss',
      description: 'Triggers when you publish content',
    },
    {
      id: 'openai',
      name: 'Generate Posts',
      icon: 'sparkles',
      description: 'AI creates social media posts',
    },
    {
      id: 'slack',
      name: 'Notify Team',
      icon: 'slack',
      description: 'Sends posts for team review',
    },
  ],
  workflow: {
    name: 'Content Distribution Pipeline',
    nodes: [
      {
        name: 'New Blog Post',
        type: 'n8n-nodes-base.rssFeedReadTrigger',
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          url: '{{rssFeed}}',
          pollTimes: {
            item: [{ mode: 'everyHour' }],
          },
        },
      },
      {
        name: 'Generate Posts',
        type: 'n8n-nodes-base.openAi',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          operation: 'text',
          prompt:
            '=Create 3 social media posts for this blog article in a {{tone}} tone:\n\nTitle: {{$json.title}}\nSummary: {{$json.contentSnippet}}\nLink: {{$json.link}}\n\nFormat as:\n1. Twitter (280 chars max)\n2. LinkedIn (longer, professional)\n3. Instagram caption (with emoji)',
        },
      },
      {
        name: 'Notify Team',
        type: 'n8n-nodes-base.slack',
        typeVersion: 1,
        position: [650, 300],
        parameters: {
          channel: '{{marketingChannel}}',
          text: '=:mega: *New Content Ready for Promotion*\n\n*{{$node["New Blog Post"].json.title}}*\n{{$node["New Blog Post"].json.link}}\n\n---\n*Generated Social Posts:*\n\n{{$json.text}}\n\n_Review and schedule these posts!_',
        },
      },
    ],
    connections: {
      'New Blog Post': {
        main: [[{ node: 'Generate Posts', type: 'main', index: 0 }]],
      },
      'Generate Posts': {
        main: [[{ node: 'Notify Team', type: 'main', index: 0 }]],
      },
    },
  },
};

/**
 * All available templates.
 */
export const templates: Template[] = [
  leadScoringTemplate,
  customerHealthTemplate,
  contentDistributionTemplate,
];

/**
 * Get a template by ID.
 */
export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

/**
 * Get templates by category.
 */
export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter((t) => t.category === category);
}
