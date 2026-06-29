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

export function listReviews() {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    const list = raw ? JSON.parse(raw) : [];
    // Newest first.
    return list.sort((a, b) => b.uploadedAt - a.uploadedAt);
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

export async function uploadStoryboard(file) {
  const reviewId = `mock-${Date.now()}`;

  // Create a dynamic copy of the mock report for this specific upload
  const data = {
    ...baseMockReport,
    filename: file.name,
    status: 'complete'
  };

  localStorage.setItem(reviewId, JSON.stringify(data));

  // Track this upload in a persistent index so previous reviews stay accessible.
  addToIndex({
    review_id: reviewId,
    filename: file.name,
    size: file.size,
    uploadedAt: Date.now(),
  });

  return new Promise((resolve) => {
    setTimeout(() => resolve({ review_id: reviewId }), 800);
  });
}

export async function getReport(reviewId) {
  const data = localStorage.getItem(reviewId);
  return data ? JSON.parse(data) : baseMockReport;
}

export async function updateFinding(findingId, payload) {
  console.log("Mock update finding:", findingId, payload);
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