import type { Template } from './types';

/**
 * Template: Webhook → Slack Alert (SIMPLE)
 *
 * The simplest possible n8n workflow for first-time users.
 * Receives any webhook event and posts it to Slack.
 */
export const webhookSlackAlertTemplate: Template = {
  id: 'webhook-slack-alert',
  name: 'Webhook → Slack Alert',
  tagline: 'Get notified when any event happens',
  description:
    'Receive webhook events and post to Slack instantly. Perfect for monitoring form submissions, payment notifications, or any external service that sends webhooks.',
  category: 'ops',
  complexity: 'simple',
  apps: ['webhook', 'slack'],
  setupTime: 3,
  steps: [
    {
      id: 'trigger',
      title: 'Set Up Your Webhook',
      description:
        'Create a URL that external services can send data to. This will trigger your workflow.',
      fields: [
        {
          id: 'webhookPath',
          type: 'text',
          label: 'Webhook Path',
          placeholder: 'e.g., my-alerts',
          required: true,
          defaultValue: 'my-alerts',
          nodeId: 'webhook',
          paramPath: 'path',
        },
      ],
    },
    {
      id: 'notify',
      title: 'Where to Send Alerts',
      description: 'Choose which Slack channel should receive the notifications.',
      fields: [
        {
          id: 'slackChannel',
          type: 'text',
          label: 'Slack Channel',
          placeholder: '#alerts',
          required: true,
          defaultValue: '#alerts',
          nodeId: 'slack',
          paramPath: 'channel',
        },
      ],
    },
  ],
  previewNodes: [
    {
      id: 'webhook',
      name: 'Receive Event',
      icon: 'webhook',
      description: 'Triggers when data is sent to your webhook URL',
    },
    {
      id: 'slack',
      name: 'Send Alert',
      icon: 'slack',
      description: 'Posts the event details to Slack',
    },
  ],
  workflow: {
    name: 'Webhook → Slack Alert',
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
        name: 'Send Alert',
        type: 'n8n-nodes-base.slack',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          channel: '{{slackChannel}}',
          text: '=:bell: *New Event Received*\n\n```\n{{JSON.stringify($json, null, 2)}}\n```\n\n_Received at {{$now.toISO()}}_',
          attachments: [],
          otherOptions: {},
        },
      },
    ],
    connections: {
      Webhook: {
        main: [[{ node: 'Send Alert', type: 'main', index: 0 }]],
      },
    },
  },
};

/**
 * Template: Form to Airtable (SIMPLE)
 *
 * Capture form submissions directly into Airtable.
 * Perfect for lead capture, contact forms, and surveys.
 */
export const formToAirtableTemplate: Template = {
  id: 'form-to-airtable',
  name: 'Form to Airtable',
  tagline: 'Capture form submissions in your Airtable base',
  description:
    'When a form is submitted, automatically save it to Airtable. Great for lead capture, contact forms, signup lists, and survey responses.',
  category: 'sales',
  complexity: 'simple',
  apps: ['webhook', 'airtable'],
  setupTime: 5,
  steps: [
    {
      id: 'trigger',
      title: 'Set Up Form Webhook',
      description:
        'Create a URL that your form will submit to. Works with Typeform, JotForm, Google Forms (via Zapier), or any custom form.',
      fields: [
        {
          id: 'webhookPath',
          type: 'text',
          label: 'Webhook Path',
          placeholder: 'e.g., form-submit',
          required: true,
          defaultValue: 'form-submit',
          nodeId: 'webhook',
          paramPath: 'path',
        },
      ],
    },
    {
      id: 'airtable',
      title: 'Connect to Airtable',
      description:
        'Choose where to save submissions. Find your Base ID in the Airtable URL: airtable.com/BASE_ID/...',
      fields: [
        {
          id: 'baseId',
          type: 'text',
          label: 'Airtable Base ID',
          placeholder: 'e.g., appXXXXXXXXXXXXXX',
          required: true,
          nodeId: 'airtable',
          paramPath: 'application',
        },
        {
          id: 'tableName',
          type: 'text',
          label: 'Table Name',
          placeholder: 'e.g., Leads',
          required: true,
          defaultValue: 'Leads',
          nodeId: 'airtable',
          paramPath: 'table',
        },
      ],
    },
  ],
  previewNodes: [
    {
      id: 'webhook',
      name: 'Form Submitted',
      icon: 'webhook',
      description: 'Triggers when someone submits your form',
    },
    {
      id: 'airtable',
      name: 'Save to Airtable',
      icon: 'airtable',
      description: 'Creates a new record in your table',
    },
  ],
  workflow: {
    name: 'Form to Airtable',
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
        name: 'Save to Airtable',
        type: 'n8n-nodes-base.airtable',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          operation: 'append',
          application: '{{baseId}}',
          table: '{{tableName}}',
          options: {},
        },
      },
    ],
    connections: {
      Webhook: {
        main: [[{ node: 'Save to Airtable', type: 'main', index: 0 }]],
      },
    },
  },
};

/**
 * Template: Daily Sheets Summary (SIMPLE)
 *
 * Fetch data from Google Sheets and send a daily summary to Slack.
 * Perfect for KPI dashboards, sales reports, and team metrics.
 */
export const dailySheetsSummaryTemplate: Template = {
  id: 'daily-sheets-summary',
  name: 'Daily Sheets Summary',
  tagline: 'Send daily data summaries from Google Sheets',
  description:
    'Automatically fetch data from a Google Sheet and send a daily summary to Slack. Perfect for KPI dashboards, sales reports, inventory updates, and team metrics.',
  category: 'ops',
  complexity: 'simple',
  apps: ['schedule', 'googleSheets', 'slack'],
  setupTime: 5,
  steps: [
    {
      id: 'schedule',
      title: 'When to Send',
      description: 'Choose what time you want to receive your daily summary.',
      fields: [
        {
          id: 'checkHour',
          type: 'select',
          label: 'Daily Summary Time',
          placeholder: 'Select time',
          required: true,
          defaultValue: '9',
          options: [
            { value: '7', label: '7:00 AM' },
            { value: '9', label: '9:00 AM' },
            { value: '12', label: '12:00 PM' },
            { value: '17', label: '5:00 PM' },
          ],
          nodeId: 'cron',
          paramPath: 'triggerTimes.item[0].hour',
        },
      ],
    },
    {
      id: 'sheets',
      title: 'Connect Your Sheet',
      description:
        'Enter your Google Sheet ID (from the URL: docs.google.com/spreadsheets/d/SHEET_ID/...) and the range to read.',
      fields: [
        {
          id: 'sheetId',
          type: 'text',
          label: 'Google Sheet ID',
          placeholder: 'e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          required: true,
          nodeId: 'sheets',
          paramPath: 'sheetId',
        },
        {
          id: 'range',
          type: 'text',
          label: 'Data Range',
          placeholder: 'e.g., Sheet1!A:E',
          required: true,
          defaultValue: 'Sheet1!A:E',
          nodeId: 'sheets',
          paramPath: 'range',
        },
      ],
    },
    {
      id: 'notify',
      title: 'Send Summary To',
      description: 'Choose which Slack channel should receive the daily summary.',
      fields: [
        {
          id: 'slackChannel',
          type: 'text',
          label: 'Slack Channel',
          placeholder: '#daily-report',
          required: true,
          defaultValue: '#daily-report',
          nodeId: 'slack',
          paramPath: 'channel',
        },
      ],
    },
  ],
  previewNodes: [
    {
      id: 'cron',
      name: 'Daily Trigger',
      icon: 'clock',
      description: 'Runs every day at your chosen time',
    },
    {
      id: 'sheets',
      name: 'Read Sheet',
      icon: 'googleSheets',
      description: 'Fetches data from your Google Sheet',
    },
    {
      id: 'slack',
      name: 'Send Summary',
      icon: 'slack',
      description: 'Posts the summary to your channel',
    },
  ],
  workflow: {
    name: 'Daily Sheets Summary',
    nodes: [
      {
        name: 'Daily Trigger',
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
        name: 'Read Sheet',
        type: 'n8n-nodes-base.googleSheets',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          operation: 'read',
          sheetId: '{{sheetId}}',
          range: '{{range}}',
          options: {},
        },
      },
      {
        name: 'Send Summary',
        type: 'n8n-nodes-base.slack',
        typeVersion: 1,
        position: [650, 300],
        parameters: {
          channel: '{{slackChannel}}',
          text: '=:chart_with_upwards_trend: *Daily Summary*\n\n*Total Rows:* {{$json.length || "N/A"}}\n*Last Updated:* {{$now.toFormat("MMM dd, yyyy HH:mm")}}\n\n_Data fetched from Google Sheets_',
          attachments: [],
          otherOptions: {},
        },
      },
    ],
    connections: {
      'Daily Trigger': {
        main: [[{ node: 'Read Sheet', type: 'main', index: 0 }]],
      },
      'Read Sheet': {
        main: [[{ node: 'Send Summary', type: 'main', index: 0 }]],
      },
    },
  },
};

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
 * Simple templates first for "First Win" experience.
 */
export const templates: Template[] = [
  // Tier 1: Simple "First Win" templates
  webhookSlackAlertTemplate,
  formToAirtableTemplate,
  dailySheetsSummaryTemplate,
  // Tier 2+: More sophisticated templates
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
