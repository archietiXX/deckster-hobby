import type { AudienceCategory } from '@deckster/shared/types';

export const audienceCategories: AudienceCategory[] = [
  {
    id: 'board',
    label: 'Board/Advisory Group',
    evidenceType: 'Strategic alignment, governance implications, risk/reward analysis, long-term value creation, fiduciary considerations, competitive positioning',
    languageRules: 'Highly formal, concise executive-level language. Lead with strategic implications. Avoid operational details — focus on governance-level decisions and oversight.',
  },
  {
    id: 'c-level',
    label: 'C-level Executives',
    evidenceType: 'Business impact metrics, revenue implications, competitive advantage, strategic fit, resource requirements, timeline to value',
    languageRules: 'Executive summary style. Lead with the bottom line. Use precise financial and business language. Be direct — every sentence should convey high-value information.',
  },
  {
    id: 'client',
    label: 'Client',
    evidenceType: 'Value delivered, ROI for their business, reliability evidence, case studies, implementation clarity, ongoing support model',
    languageRules: 'Professional but relationship-focused. Emphasize partnership and trust. Be transparent about commitments. Avoid internal jargon — speak in terms of their business outcomes.',
  },
  {
    id: 'department-head',
    label: 'Department Head',
    evidenceType: 'Cross-functional impact, resource allocation needs, departmental KPIs affected, integration with existing workflows, team capacity requirements',
    languageRules: 'Structured and practical. Balance strategic context with operational specifics. Show awareness of inter-departmental dependencies and political considerations.',
  },
  {
    id: 'direct-manager',
    label: 'Direct Manager',
    evidenceType: 'Feasibility assessment, team workload impact, quick wins vs. long-term efforts, risk mitigation, progress tracking methods, resource needs',
    languageRules: 'Conversational but organized. Be specific about what you need from them. Show you have thought through execution details and potential blockers.',
  },
  {
    id: 'external-partners',
    label: 'External Partners',
    evidenceType: 'Mutual benefit analysis, integration requirements, shared goals, contractual implications, co-investment needs, market opportunity',
    languageRules: 'Diplomatic and collaborative. Emphasize shared value creation. Be clear about expectations and boundaries. Maintain professional courtesy while being direct about mutual commitments.',
  },
  {
    id: 'general-public',
    label: 'General Public',
    evidenceType: 'Relatable real-world impact, simple statistics, human stories, visual evidence, before/after comparisons, social proof',
    languageRules: 'Plain language, zero jargon. Use analogies and concrete examples. Engage emotionally before presenting data. Keep concepts accessible to someone with no domain expertise.',
  },
  {
    id: 'investors',
    label: 'Investors',
    evidenceType: 'Market size and growth, unit economics, competitive moat, traction metrics, financial projections, team credibility, exit potential, risk factors',
    languageRules: 'Data-driven and forward-looking. Lead with traction and market opportunity. Be precise with numbers. Address risks proactively. Show you understand the investment thesis.',
  },
  {
    id: 'potential-customers',
    label: 'Potential Customers',
    evidenceType: 'Problem-solution fit, comparison with alternatives, pricing clarity, implementation ease, customer testimonials, time to value, support availability',
    languageRules: 'Benefits-focused, not features-focused. Speak to their pain points directly. Use social proof and concrete examples. Be honest about limitations — it builds trust.',
  },
  {
    id: 'project-stakeholders',
    label: 'Project Stakeholders',
    evidenceType: 'Project status and milestones, scope changes, budget tracking, risk register updates, dependency status, decision points needed',
    languageRules: 'Structured and status-oriented. Use clear RAG (red/amber/green) framing. Highlight decisions needed. Be transparent about blockers and deviations from plan.',
  },
  {
    id: 'senior-leadership',
    label: 'Senior Leadership',
    evidenceType: 'Organizational impact, strategic alignment, scalability, innovation potential, talent implications, change management needs',
    languageRules: 'Polished and strategic. Frame proposals in terms of organizational goals. Show both the vision and the execution path. Balance ambition with pragmatism.',
  },
  {
    id: 'team',
    label: 'Team',
    evidenceType: 'Clear action items, role clarity, timeline specifics, resources available, skill development opportunities, how their work connects to the bigger picture',
    languageRules: 'Transparent and motivating. Be specific about expectations. Show you value their perspective. Provide context for why decisions were made. Encourage questions.',
  },
  {
    id: 'trainees',
    label: 'Trainees/New Hires',
    evidenceType: 'Step-by-step processes, learning objectives, examples and demonstrations, practice opportunities, where to find help, success criteria',
    languageRules: 'Patient, encouraging, and structured. Define all terms. Use progressive disclosure — build from simple to complex. Check understanding frequently. Normalize asking questions.',
  },
];
