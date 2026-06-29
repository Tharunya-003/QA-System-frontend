// src/mockData.js
export const baseMockReport = {
    status: 'complete',
    course_model: {
        title: 'Advanced Cyber Security',
        slides: [
            { index: '1', title: 'Introduction', role: 'Title Slide' },
            { index: '2', title: 'RSA Cryptosystems', role: 'Content' }
        ],
        objectives: ['Understand RSA', 'Analyze Hash Functions']
    },
    findings: [
        {
            finding_id: 'f1',
            location: { slide: '1' },
            severity: 'minor',
            rule_id: 'R-001',
            principle: 'Layout',
            method_used: 'Grid Check',
            evidence: 'Logo is positioned outside the safe zone.',
            remark: 'The logo is at X:50, Y:50.',
            recommendation: 'Move to top-right corner.',
            status: 'open',
            confidence: 0.98
        }
    ],
    scorecard: {
        'Layout': { status: 'minor', findings: 1, blockers: 0, majors: 0, minors: 1, suggestions: 0 }
    },
    alignment_matrix: [
        {
            lo_id: 'LO1',
            lo_text: 'Understand RSA',
            bloom_level: 'Analyze',
            content_slides: ['1', '2'],
            kc_slides: [],
            assessment_slides: [],
            summary_covered: true
        }
    ],
    parse_report: { low_confidence_slides: [], unmapped_columns: [], adapter_warnings: [] }
};
