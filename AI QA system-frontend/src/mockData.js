// src/mockData.js
export const baseMockReport = {
    status: 'complete',
    course_model: {
        title: 'Advanced Cyber Security',
        slides: [
            { index: '1', title: 'Introduction', role: 'Title Slide' },
            { index: '2', title: 'RSA Cryptosystems', role: 'Content' },
            { index: '3', title: 'Hash Functions', role: 'Content' },
            { index: '4', title: 'Knowledge Check', role: 'Assessment' },
            { index: '5', title: 'Summary', role: 'Summary' }
        ],
        objectives: ['Understand RSA', 'Analyze Hash Functions', 'Apply Threat Modeling']
    },
    findings: [
        // ----- Slide 1 -----
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
        },
        {
            finding_id: 'f2',
            location: { slide: '1' },
            severity: 'suggestion',
            rule_id: 'R-014',
            principle: 'Typography',
            method_used: 'Style Lint',
            evidence: 'Title uses two different font families.',
            remark: 'Heading mixes a serif and a sans-serif face.',
            recommendation: 'Standardise on a single display font for headings.',
            status: 'open',
            confidence: 0.72
        },
        {
            finding_id: 'f3',
            location: { slide: '1' },
            severity: 'major',
            rule_id: 'R-022',
            principle: 'Accessibility',
            method_used: 'Contrast Check',
            evidence: 'Subtitle contrast ratio is 2.9:1 against the background.',
            remark: 'Text fails WCAG AA (needs at least 4.5:1).',
            recommendation: 'Darken the background or lighten the subtitle text.',
            status: 'open',
            confidence: 0.95
        },
        // ----- Slide 2 -----
        {
            finding_id: 'f4',
            location: { slide: '2' },
            severity: 'blocker',
            rule_id: 'R-003',
            principle: 'Content',
            method_used: 'LLM Review',
            evidence: 'The RSA key-generation formula on this slide is incorrect.',
            remark: 'Shown as n = p + q; it should be n = p × q.',
            recommendation: 'Correct the modulus formula before publishing.',
            status: 'open',
            confidence: 0.99
        },
        {
            finding_id: 'f5',
            location: { slide: '2' },
            severity: 'minor',
            rule_id: 'R-018',
            principle: 'Media',
            method_used: 'Asset Check',
            evidence: 'Diagram image is 640×360 but displayed at 1280×720.',
            remark: 'Upscaled raster looks blurry on retina displays.',
            recommendation: 'Replace with a vector (SVG) or a 2× resolution image.',
            status: 'open',
            confidence: 0.88
        },
        {
            finding_id: 'f6',
            location: { slide: '2' },
            severity: 'suggestion',
            rule_id: 'R-031',
            principle: 'Narration',
            method_used: 'Script Review',
            evidence: 'On-screen text duplicates the narration verbatim.',
            remark: 'Reading and listening the same words increases load.',
            recommendation: 'Summarise on-screen text into short key phrases.',
            status: 'open',
            confidence: 0.66
        },
        // ----- Slide 3 -----
        {
            finding_id: 'f7',
            location: { slide: '3' },
            severity: 'major',
            rule_id: 'R-009',
            principle: 'Learning Objectives',
            method_used: 'Alignment Check',
            evidence: 'No stated objective maps to hash collision resistance.',
            remark: 'Content is present but not tied to a learning outcome.',
            recommendation: 'Add an objective covering collision resistance.',
            status: 'open',
            confidence: 0.9
        },
        {
            finding_id: 'f8',
            location: { slide: '3' },
            severity: 'minor',
            rule_id: 'R-002',
            principle: 'Layout',
            method_used: 'Grid Check',
            evidence: 'Body text overflows the content placeholder by 12px.',
            remark: 'Bottom line is clipped on 16:9 export.',
            recommendation: 'Reduce font size or split across two slides.',
            status: 'open',
            confidence: 0.84
        },
        // ----- Slide 4 -----
        {
            finding_id: 'f9',
            location: { slide: '4' },
            severity: 'blocker',
            rule_id: 'R-041',
            principle: 'Assessment',
            method_used: 'Answer Key Check',
            evidence: 'Quiz question 2 has no correct option marked.',
            remark: 'All four options are flagged as incorrect.',
            recommendation: 'Mark the correct answer in the answer key.',
            status: 'open',
            confidence: 0.97
        },
        {
            finding_id: 'f10',
            location: { slide: '4' },
            severity: 'suggestion',
            rule_id: 'R-037',
            principle: 'Interaction',
            method_used: 'UX Review',
            evidence: 'No feedback is shown after an incorrect answer.',
            remark: 'Learners cannot tell why a choice was wrong.',
            recommendation: 'Add remediation feedback for each distractor.',
            status: 'open',
            confidence: 0.7
        }
    ],
    scorecard: {
        'Content': { status: 'blocker', findings: 1, blockers: 1, majors: 0, minors: 0, suggestions: 0 },
        'Assessment': { status: 'blocker', findings: 1, blockers: 1, majors: 0, minors: 0, suggestions: 0 },
        'Accessibility': { status: 'major', findings: 1, blockers: 0, majors: 1, minors: 0, suggestions: 0 },
        'Learning Objectives': { status: 'major', findings: 1, blockers: 0, majors: 1, minors: 0, suggestions: 0 },
        'Layout': { status: 'minor', findings: 2, blockers: 0, majors: 0, minors: 2, suggestions: 0 },
        'Media': { status: 'minor', findings: 1, blockers: 0, majors: 0, minors: 1, suggestions: 0 },
        'Typography': { status: 'pass', findings: 1, blockers: 0, majors: 0, minors: 0, suggestions: 1 },
        'Narration': { status: 'pass', findings: 1, blockers: 0, majors: 0, minors: 0, suggestions: 1 },
        'Interaction': { status: 'pass', findings: 1, blockers: 0, majors: 0, minors: 0, suggestions: 1 }
    },
    alignment_matrix: [
        {
            lo_id: 'LO1',
            lo_text: 'Understand RSA',
            bloom_level: 'Understand',
            content_slides: ['1', '2'],
            kc_slides: ['4'],
            assessment_slides: ['4'],
            summary_covered: true
        },
        {
            lo_id: 'LO2',
            lo_text: 'Analyze Hash Functions',
            bloom_level: 'Analyze',
            content_slides: ['3'],
            kc_slides: [],
            assessment_slides: [],
            summary_covered: true
        },
        {
            lo_id: 'LO3',
            lo_text: 'Apply Threat Modeling',
            bloom_level: 'Apply',
            content_slides: [],
            kc_slides: [],
            assessment_slides: [],
            summary_covered: false
        }
    ],
    parse_report: { low_confidence_slides: [], unmapped_columns: [], adapter_warnings: [] }
};
