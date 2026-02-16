import type { AudienceCategory } from '@deckster/shared/types';

export const audienceCategories: AudienceCategory[] = [
  {
    id: 'board',
    label: 'Board/Advisory Group',
    evidenceType: 'Long-term value creation metrics, fiduciary risk assessments, regulatory compliance documentation, peer company comparisons, capital efficiency analyses',
    languageRules: 'Highly formal, governance-focused vocabulary, emphasis on oversight and risk mitigation, assume deep business sophistication, balance detail with brevity, confident but accountable tone, focus on strategic choices and their trade-offs',
  },
  {
    id: 'c-level',
    label: 'C-level Executives',
    evidenceType: 'Strategic impact metrics (market share, competitive positioning, revenue/profit influence), board-level KPIs and trend analysis, industry benchmark comparisons with peer companies, regulatory/compliance implications, organizational risk assessments, M&A or strategic partnership implications, long-term value creation models',
    languageRules: 'Executive brevity (no fluff, get to the point), very high formality with strategic focus, lead with business impact not features, speak in outcomes and strategic implications (growth, margin, risk, competitive advantage), acknowledge trade-offs and opportunity costs explicitly, use financial and strategic terminology fluently, frame as strategic choices requiring their decision authority, respect time scarcity (clear recommendation with supporting logic)',
  },
  {
    id: 'client',
    label: 'Client',
    evidenceType: 'ROI calculations specific to their business, case studies from similar companies/industries, implementation timeline and risk mitigation plans, client testimonials and references',
    languageRules: 'Professional but approachable, adapt formality to client\'s culture, focus on their specific problem and outcomes, consultative tone (partnership not vendor), address concerns proactively, balance confidence with listening',
  },
  {
    id: 'department-head',
    label: 'Department Head',
    evidenceType: 'Operational efficiency metrics, team productivity data, resource utilization reports, internal peer department examples, implementation feasibility assessments',
    languageRules: 'Professional with operational focus, moderate formality, balance strategic context with tactical detail, acknowledge resource constraints and competing priorities, collaborative tone (peer-level), specific and actionable',
  },
  {
    id: 'direct-manager',
    label: 'Direct Manager',
    evidenceType: 'Team performance metrics, individual workload impact assessments, delivery track record (personal credibility), specific execution timelines and task breakdowns',
    languageRules: 'Direct and conversational, low-to-moderate formality, focus on immediate work implications, collaborative peer tone, specific about timeline and dependencies',
  },
  {
    id: 'external-partners',
    label: 'External Partners',
    evidenceType: 'Partnership case studies with measurable mutual outcomes, complementary capability demonstrations, joint market opportunity data, existing partner testimonials',
    languageRules: 'Professional and collaborative, moderate-to-high formality, emphasize shared value and aligned interests, balanced tone (equal footing not vendor/client), focus on co-creation',
  },
  {
    id: 'general-public',
    label: 'General Public',
    evidenceType: 'Real-world everyday examples and analogies, accessible statistics with clear sourcing, human interest stories and relatable scenarios, visual demonstrations and simplified models, consumer testimonials and mainstream media references, basic cost-benefit comparisons in everyday terms, public data and widely recognized facts',
    languageRules: 'Conversational and accessible (no jargon or insider terminology), low formality with warmth, explain technical concepts through familiar comparisons, focus on "what this means for you" not technical detail, avoid assumptions about prior knowledge, use storytelling and concrete examples, emotionally intelligent (acknowledge concerns and perspectives), inclusive language that doesn\'t assume expertise, balance simplicity with accuracy (don\'t oversimplify to the point of misleading)',
  },
  {
    id: 'investors',
    label: 'Investors',
    evidenceType: 'Traction metrics (user growth, revenue, retention), market size data with credible sources, competitive differentiation proof, team credentials and relevant track record, early customer/user testimonials or LOIs',
    languageRules: 'Confident but data-driven, high formality, balance vision with proof points, use startup/VC terminology (TAM/SAM/SOM, burn rate, unit economics), emphasize scalability and market timing, acknowledge risks directly, focus on asymmetric upside opportunity',
  },
  {
    id: 'potential-customers',
    label: 'Potential Customers',
    evidenceType: 'Clear ROI and business impact metrics, relevant customer success examples and case studies, before/after comparisons, quantified pain-to-value translation, competitive differentiation points, implementation simplicity and time-to-value estimates, risk reduction assurances (low lift, low regret), pricing/packaging logic when appropriate',
    languageRules: 'Persuasive but not hypey, confident and outcome-focused, minimal jargon, anchor on the buyer\'s goals not product features, emphasize clarity and credibility over excitement, address objections implicitly (switching cost, trust, effort), crisp and direct, strong narrative flow: problem \u2192 stakes \u2192 solution \u2192 proof \u2192 next step',
  },
  {
    id: 'project-stakeholders',
    label: 'Project Stakeholders',
    evidenceType: 'Project milestone achievements and timeline adherence, resource utilization reports, risk and issue logs with mitigation status, dependency tracking and blocker resolution, deliverable quality metrics',
    languageRules: 'Clear and transparent, moderate formality, proactive about problems and risks, specific about dependencies and needs, collaborative tone, action-oriented on next steps',
  },
  {
    id: 'senior-leadership',
    label: 'Senior Leadership',
    evidenceType: 'Revenue and market share data, ROI analyses with clear financial impact, competitive positioning reports, industry benchmarks from credible sources (Gartner, McKinsey, etc.)',
    languageRules: 'Strategic vocabulary, high formality, minimal technical detail, confident authoritative tone, emphasis on implications over mechanics, assume business acumen',
  },
  {
    id: 'team',
    label: 'Team',
    evidenceType: 'Shared work context and recent team accomplishments, specific task examples and work artifacts, peer experiences and lessons learned, direct manager endorsement or team consensus',
    languageRules: 'Casual and conversational, low formality, peer-level tone (collaborative not hierarchical), focus on practical impact to daily work, authentic and direct',
  },
  {
    id: 'trainees',
    label: 'Trainees/New Hires',
    evidenceType: 'Step-by-step processes with clear rationale, internal knowledge base references and documentation, examples from recent projects with context, best practice frameworks with application guidance, common mistake patterns and how to avoid them, relevant company policies and cultural norms, learning resources and development paths',
    languageRules: 'Supportive and educational tone, low-to-moderate formality (approachable not patronizing), explain context and "why" behind processes not just "what", normalize learning curve and questions, balance detail with accessibility (avoid overwhelming), use internal terminology but define it, emphasize pattern recognition over memorization, encouraging tone that builds confidence, connect learning to broader career development',
  },
];
