/**
 * API Client for FastAPI Backend
 * Handles REST and WebSocket connections
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export interface ResearchRequest {
  topic: string;
  clarifications: Record<string, string>;
  user_id?: string;
  max_iterations?: number;
}

export interface ResearchResponse {
  research_id: string;
  status: string;
  message: string;
}

export interface StreamUpdate {
  type: string;
  status?: string;
  iteration?: number;
  timestamp: string;
  data?: any;
}

/**
 * Initialize a new research task
 */
export async function createResearch(
  request: ResearchRequest
): Promise<ResearchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/research`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to create research: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Stream research progress via WebSocket
 */
export function streamResearch(
  researchId: string,
  onUpdate: (update: StreamUpdate) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): () => void {
  const ws = new WebSocket(`${WS_BASE_URL}/api/research/stream/${researchId}`);

  ws.onmessage = (event) => {
    try {
      const update: StreamUpdate = JSON.parse(event.data);
      onUpdate(update);

      // Check if research is complete
      if (update.type === "report" || update.status === "completed") {
        onComplete();
      }
    } catch (error) {
      onError(new Error("Failed to parse update"));
    }
  };

  ws.onerror = (event) => {
    onError(new Error("WebSocket error"));
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed");
  };

  // Return cleanup function
  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}

/**
 * Get research result
 */
export async function getResearch(researchId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/research/${researchId}`);

  if (!response.ok) {
    throw new Error(`Failed to get research: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get research analytics
 */
export async function getAnalytics(researchId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/analytics/${researchId}`);

  if (!response.ok) {
    throw new Error(`Failed to get analytics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Export research as PDF
 */
export async function exportPDF(researchId: string): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/api/research/${researchId}/export/pdf`
  );

  if (!response.ok) {
    throw new Error(`Failed to export PDF: ${response.statusText}`);
  }

  return response.blob();
}

/**
 * Export research as CSV
 */
export async function exportCSV(researchId: string): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/api/research/${researchId}/export/csv`
  );

  if (!response.ok) {
    throw new Error(`Failed to export CSV: ${response.statusText}`);
  }

  return response.blob();
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
