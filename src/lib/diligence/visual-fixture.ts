/** VISUAL TEST ONLY. NEVER IMPORT FROM PRODUCTION PAGE OR API. */
import type { DiligenceRoomDTO } from "./types";

export const VISUAL_REFERENCE_TIME = "2026-09-06T12:00:00.000Z";

export const DILIGENCE_VISUAL_ROOM = {
  "id": "8f14e45f-ea67-4f21-9ba0-23c80b3e6a3e",
  "code": "KV-024",
  "status": "active_review",
  "closesAt": "2026-09-18T00:00:00.000Z",
  "readinessScore": 68,
  "viewer": {
    "userId": "610b32ba-8f87-4d26-94fb-6fbe18bd96f9",
    "displayName": "Adaeze Okafor",
    "initials": "AO",
    "role": "reviewer",
    "photoUrl": null
  },
  "deal": {
    "id": "f5279d15-ab4e-40b7-bc6e-833bf745c69d",
    "startupId": "9212af34-1380-4dc3-b79c-5ccbfad12f5f",
    "companyName": "Terranova Mobility",
    "companyInitials": "TM",
    "descriptor": "Electric logistics · Kigali, Rwanda",
    "round": "Seed",
    "targetAmount": 2400000,
    "currency": "USD",
    "leadName": "Baobab Capital"
  },
  "workstreams": [
    {
      "id": "workstream-1",
      "title": "Market & customer evidence",
      "ownerUserId": null,
      "ownerName": "Adaeze O.",
      "progress": 86,
      "status": "Clear"
    },
    {
      "id": "workstream-2",
      "title": "Product & technology",
      "ownerUserId": null,
      "ownerName": "Kwame A.",
      "progress": 72,
      "status": "Review"
    },
    {
      "id": "workstream-3",
      "title": "Financial model",
      "ownerUserId": null,
      "ownerName": "Maya R.",
      "progress": 64,
      "status": "Review"
    },
    {
      "id": "workstream-4",
      "title": "Legal & governance",
      "ownerUserId": null,
      "ownerName": "Chidi N.",
      "progress": 45,
      "status": "Blocked"
    }
  ],
  "evidenceSummary": {
    "resolved": 12,
    "total": 17
  },
  "evidence": [
    {
      "id": "evidence-1",
      "title": "Customer cohort export",
      "workstreamId": "workstream-1",
      "workstream": "Market",
      "status": "Verified",
      "ownerUserId": null,
      "ownerName": "Adaeze O.",
      "updatedAt": "2026-09-06T10:00:00.000Z",
      "sourceType": null,
      "sourceUri": null,
      "claim": null
    },
    {
      "id": "evidence-2",
      "title": "Payments architecture review",
      "workstreamId": "workstream-2",
      "workstream": "Technology",
      "status": "Needs response",
      "ownerUserId": null,
      "ownerName": "Kwame A.",
      "updatedAt": "2026-09-05T10:00:00.000Z",
      "sourceType": null,
      "sourceUri": null,
      "claim": null
    },
    {
      "id": "evidence-3",
      "title": "Three-year operating model",
      "workstreamId": "workstream-3",
      "workstream": "Finance",
      "status": "Verified",
      "ownerUserId": null,
      "ownerName": "Maya R.",
      "updatedAt": "2026-09-05T10:00:00.000Z",
      "sourceType": null,
      "sourceUri": null,
      "claim": null
    },
    {
      "id": "evidence-4",
      "title": "Nigeria operating licence",
      "workstreamId": "workstream-4",
      "workstream": "Legal",
      "status": "Missing",
      "ownerUserId": null,
      "ownerName": "Chidi N.",
      "updatedAt": "2026-09-03T10:00:00.000Z",
      "sourceType": null,
      "sourceUri": null,
      "claim": null
    }
  ],
  "risks": [
    {
      "id": "risk-1",
      "riskCode": "R-01",
      "severity": "Critical",
      "category": "Regulatory",
      "title": "Rwanda operating licence scope",
      "description": "Expansion revenue cannot be underwritten until the licence scope is independently verified.",
      "status": "open",
      "ownerUserId": null
    },
    {
      "id": "risk-2",
      "riskCode": "R-02",
      "severity": "High",
      "category": "Financial",
      "title": "Supplier rebate concentration",
      "description": "Base-case gross margin includes an unsigned volume rebate from a single battery supplier.",
      "status": "open",
      "ownerUserId": null
    },
    {
      "id": "risk-3",
      "riskCode": "R-03",
      "severity": "Medium",
      "category": "Commercial",
      "title": "Enterprise customer concentration",
      "description": "The top three accounts contribute 41% of annual recurring revenue.",
      "status": "open",
      "ownerUserId": null
    }
  ],
  "signals": [
    {
      "kind": "Positive",
      "message": "Enterprise retention confirmed at 91% across the latest two cohorts."
    },
    {
      "kind": "Watch",
      "message": "Gross margin assumptions rely on a supplier rebate not yet contracted."
    },
    {
      "kind": "Critical",
      "message": "Operating licence evidence is incomplete for the proposed expansion."
    }
  ],
  "discussion": [
    {
      "id": "message-1",
      "parentMessageId": null,
      "authorUserId": "reviewer-1",
      "authorName": "Adaeze Okafor",
      "authorInitials": "AO",
      "authorRoleLabel": "Reviewer",
      "body": "The retention analysis holds up. I checked the raw cohort export against the investor memo.",
      "createdAt": "2026-09-06T12:00:00.000Z"
    },
    {
      "id": "message-2",
      "parentMessageId": null,
      "authorUserId": "reviewer-2",
      "authorName": "Kwame Asante",
      "authorInitials": "KA",
      "authorRoleLabel": "Reviewer",
      "body": "Agree on retention. I still need the founder to reconcile the telemetry volume with the infrastructure invoice.",
      "createdAt": "2026-09-06T12:00:00.000Z"
    },
    {
      "id": "message-3",
      "parentMessageId": null,
      "authorUserId": "reviewer-3",
      "authorName": "Chidi Nwosu",
      "authorInitials": "CN",
      "authorRoleLabel": "Reviewer",
      "body": "Licence counsel confirmed receipt. Independent scope opinion is expected Thursday.",
      "createdAt": "2026-09-06T12:00:00.000Z"
    }
  ],
  "activity": {
    "reviewerCount": 14,
    "activeTodayCount": 7,
    "marketCount": 4,
    "avatars": [
      {
        "initials": "AO",
        "displayName": "Adaeze Okafor"
      },
      {
        "initials": "KA",
        "displayName": "Kwame Asante"
      },
      {
        "initials": "MR",
        "displayName": "Maya R."
      },
      {
        "initials": "CN",
        "displayName": "Chidi Nwosu"
      },
      {
        "initials": "+10",
        "displayName": "10 more reviewers"
      }
    ]
  },
  "latestRecommendation": {
    "id": "recommendation-1",
    "decision": "Proceed with conditions",
    "rationale": "Customer retention and unit economics support continued conviction. Proceed subject to independent confirmation that the Rwanda operating licence covers the planned fleet expansion.",
    "conditions": "Receive counsel opinion on licence scope; execute the supplier rebate agreement before funds are released.",
    "submittedAt": "2026-09-06T12:00:00.000Z"
  }
} satisfies DiligenceRoomDTO;
