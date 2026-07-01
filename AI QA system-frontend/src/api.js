// // Thin API client. All paths are relative so the Vite dev proxy (or same-origin
// // deploy) routes them to the FastAPI backend.

// export async function uploadStoryboard(file) {
//   const form = new FormData()
//   form.append('file', file)
//   const res = await fetch('/api/reviews', { method: 'POST', body: form })
//   if (!res.ok) {
//     const detail = await res.json().catch(() => ({}))
//     throw new Error(detail.detail || `Upload failed (${res.status})`)
//   }
//   return res.json()
// }

// export async function getReport(reviewId) {
//   const res = await fetch(`/api/reviews/${reviewId}/report`)
//   if (!res.ok) throw new Error(`Report fetch failed (${res.status})`)
//   return res.json()
// }

// export async function updateFinding(findingId, payload) {
//   const res = await fetch(`/api/findings/${findingId}`, {
//     method: 'PATCH',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload),
//   })
//   if (!res.ok) throw new Error(`Feedback failed (${res.status})`)
//   return res.json()
// }

// export async function getRubric() {
//   const res = await fetch('/api/rubric')
//   if (!res.ok) throw new Error(`Rubric fetch failed (${res.status})`)
//   return res.json()
// }

// src/api.js
import { baseMockReport } from './mockData.js';

const INDEX_KEY = 'reviewIndex';
const GUIDELINES_KEY = 'guidelinesIndex';

export function listReviews() {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    const list = raw ? JSON.parse(raw) : [];
    // Pinned first, then newest first.
    return list.sort((a, b) => {
      const aPinned = !!a.pinned;
      const bPinned = !!b.pinned;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return b.uploadedAt - a.uploadedAt;
    });
  } catch {
    return [];
  }
}

function addToIndex(entry) {
  const list = listReviews();
  localStorage.setItem(INDEX_KEY, JSON.stringify([entry, ...list]));
}

export function deleteReview(reviewId) {
  localStorage.removeItem(reviewId);
  const list = listReviews().filter((r) => r.review_id !== reviewId);
  localStorage.setItem(INDEX_KEY, JSON.stringify(list));
}

export async function uploadStoryboard(file, guidelinesFile) {
  const reviewId = `mock-${Date.now()}`;

  // Create a dynamic copy of the mock report for this specific upload
  const data = {
    ...baseMockReport,
    filename: file.name,
    status: 'complete',
    guidelines_name: guidelinesFile ? guidelinesFile.name : null
  };

  // If a guidelines file is uploaded, change findings to compare against the custom file
  if (guidelinesFile) {
    data.findings = [
      {
        finding_id: 'custom-f1',
        location: { slide: '1' },
        severity: 'major',
        rule_id: 'CUSTOM-GUIDELINE-01',
        principle: 'Custom Guidelines',
        method_used: 'AI Document Compare',
        evidence: `Storyboard slides do not match learning outcome goals in Section 2.1 of '${guidelinesFile.name}'.`,
        remark: `The uploaded custom guidelines document (${guidelinesFile.name}) specifies that cyber security course content must include distinct compliance checkpoints. Slide 1 failed this requirement.`,
        recommendation: `Align slides and assessment with the instructions in: ${guidelinesFile.name}`,
        status: 'open',
        confidence: 0.96
      }
    ];
    data.scorecard = {
      'Custom Guidelines': { status: 'major', findings: 1, blockers: 0, majors: 1, minors: 0, suggestions: 0 }
    };
  }

  localStorage.setItem(reviewId, JSON.stringify(data));

  // Track this upload in a persistent index so previous reviews stay accessible.
  addToIndex({
    review_id: reviewId,
    filename: file.name,
    size: file.size,
    uploadedAt: Date.now(),
    guidelines_name: guidelinesFile ? guidelinesFile.name : null
  });

  return new Promise((resolve) => {
    setTimeout(() => resolve({ review_id: reviewId }), 800);
  });
}

export async function getReport(reviewId) {
  const data = localStorage.getItem(reviewId);
  return data ? JSON.parse(data) : baseMockReport;
}

const FINDING_STATE_KEY = 'findingState';

export function getFindingOverride(findingId) {
  try {
    const map = JSON.parse(localStorage.getItem(FINDING_STATE_KEY) || '{}');
    return map[findingId] || null;
  } catch {
    return null;
  }
}

export async function updateFinding(findingId, payload) {
  const map = JSON.parse(localStorage.getItem(FINDING_STATE_KEY) || '{}');
  map[findingId] = { ...(map[findingId] || {}), ...payload };
  localStorage.setItem(FINDING_STATE_KEY, JSON.stringify(map));
  return { success: true };
}

export async function getRubric() {
  return {
    version: "1.0",
    principle_count: 5,
    rule_count: 12,
    rules: [
      { rule_id: "R-001", principle: "Layout", description: "Grid alignment", applies_to: "All", method: "Static", severity: "minor" }
    ]
  };
}

export function togglePinReview(reviewId) {
  try {
    const list = JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
    const updated = list.map((r) => {
      if (r.review_id === reviewId) {
        return { ...r, pinned: !r.pinned };
      }
      return r;
    });
    localStorage.setItem(INDEX_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

export function editReviewFilename(reviewId, newFilename) {
  try {
    const list = JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
    const updated = list.map((r) => {
      if (r.review_id === reviewId) {
        return { ...r, filename: newFilename };
      }
      return r;
    });
    localStorage.setItem(INDEX_KEY, JSON.stringify(updated));

    const reportData = localStorage.getItem(reviewId);
    if (reportData) {
      const parsed = JSON.parse(reportData);
      parsed.filename = newFilename;
      localStorage.setItem(reviewId, JSON.stringify(parsed));
    }
  } catch (e) {
    console.error(e);
  }
}

// Saves a guidelines file to a dedicated index the moment it is selected by the client.
export function saveGuideline(file) {
  try {
    const list = JSON.parse(localStorage.getItem(GUIDELINES_KEY) || '[]');
    // Avoid exact duplicates (same name + size). Update uploadedAt if re-uploaded.
    const existing = list.findIndex(g => g.name === file.name && g.size === file.size);
    const entry = {
      name: file.name,
      size: file.size,
      uploadedAt: Date.now(),
    };
    if (existing !== -1) {
      list[existing] = entry;
    } else {
      list.unshift(entry);
    }
    localStorage.setItem(GUIDELINES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

// Returns all guidelines that have been uploaded by the client, newest first.
export function listGuidelines() {
  try {
    const list = JSON.parse(localStorage.getItem(GUIDELINES_KEY) || '[]');
    return list.sort((a, b) => b.uploadedAt - a.uploadedAt);
  } catch {
    return [];
  }
}