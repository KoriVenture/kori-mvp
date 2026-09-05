# Collaborative Due Diligence database contract

This application consumes the following external logical database contract. Schema lifecycle is external to `kori-mvp`; this document contains no SQL commands.

## Existing tables reused

```text
profiles
deals
startups
spvs
community_memberships
diligence_reviews
```

`diligence_reviews` remains the existing assessments/reviews table. It must not be repurposed for discussion or invitations.

## Existing contract extension

The application expects nullable `startups.city` to construct:

```text
{sector} · {city}, {country}
```

When this field is not provisioned in Supabase, use only the data that is actually available and do not invent a city.

## Required logical objects

### `diligence_rooms`

```text
id                    uuid
deal_id               uuid, unique
room_code             text, unique
status                active_review | paused | decision_recorded | closed
closes_at             timestamptz | null
readiness_score       integer 0..100
created_by_user_id    uuid
created_at            timestamptz
updated_at            timestamptz
```

### `diligence_room_members`

```text
id                    uuid
room_id               uuid
user_id               uuid
role                  lead_reviewer | reviewer
status                invited | active | removed
invited_by_user_id    uuid | null
joined_at             timestamptz | null
last_active_at        timestamptz | null
created_at            timestamptz
unique(room_id, user_id)
```

### `diligence_workstreams`

```text
id                    uuid
room_id               uuid
key                   market_customer | product_technology | financial_model | legal_governance
title                 text
owner_user_id         uuid | null
sort_order            integer
created_at            timestamptz
updated_at            timestamptz
```

Progress and visual status `Clear | Review | Blocked` are derived server-side from this workstream’s evidence requests and risks; clients do not provide them.

### `diligence_evidence_requests`

```text
id                     uuid
room_id                uuid
workstream_id          uuid
requested_by_user_id   uuid
requested_from_user_id uuid | null
title                  text
request_text           text
status                 open | needs_response | resolved | cancelled
due_at                 timestamptz | null
resolved_at            timestamptz | null
created_at             timestamptz
updated_at             timestamptz
```

### `diligence_evidence_items`

```text
id                    uuid
room_id               uuid
workstream_id         uuid
request_id            uuid | null
review_id             uuid | null
title                 text
source_type           text | null
source_uri            text | null
claim                 text | null
owner_user_id         uuid | null
status                verified | needs_response | missing
confidence            numeric | null
created_at            timestamptz
updated_at            timestamptz
```

Do not replace the existing `diligence_evidence` table; this object provides the collaborative register without changing historical `diligence_reviews` semantics.

### `diligence_risks`

```text
id                    uuid
room_id               uuid
workstream_id         uuid | null
risk_code             text
severity              critical | high | medium
category              text
title                 text
description           text
owner_user_id         uuid | null
status                open | under_review | mitigated | accepted | closed
created_by_user_id    uuid
created_at            timestamptz
updated_at            timestamptz
```

### `diligence_discussion_messages`

```text
id                    uuid
room_id               uuid
user_id               uuid
parent_message_id     uuid | null
body                  text
created_at            timestamptz
updated_at            timestamptz
```

`parent_message_id` supports replies without a second table.

### `diligence_recommendations`

```text
id                    uuid
room_id               uuid
reviewer_user_id      uuid
decision              proceed | proceed_with_conditions | pause_diligence | decline
rationale             text
conditions            text | null
readiness_score       integer 0..100
evidence_snapshot     jsonb
risk_snapshot         jsonb
supersedes_id         uuid | null
submitted_at          timestamptz
```

Recommendations are immutable. A correction inserts a new recommendation and sets `supersedes_id`; it never overwrites the prior one.

### `diligence_room_invites`

```text
id                    uuid
room_id               uuid
token_hash            text, unique
invited_email         text | null
invited_by_user_id    uuid
expires_at            timestamptz
accepted_by_user_id   uuid | null
accepted_at           timestamptz | null
revoked_at            timestamptz | null
created_at            timestamptz
```

Never store the raw token. Generate 32 random bytes, encode as base64url, store only its SHA-256 hash, and return the raw token once to the invitation creator.

## Required external RLS and ownership rules

- The authenticated user must have an investor profile.
- A room may be read only by an active member of that room.
- Evidence-request access requires active membership.
- Risk creation and editing require active membership.
- Discussion and replies require active membership; `user_id` is always the authenticated user.
- Recommendation submission requires active membership; `reviewer_user_id` is always the authenticated user.
- An existing recommendation cannot receive a destructive update.
- Only a `lead_reviewer` can create an invitation.
- Invitation acceptance requires an authenticated user matching the invitation, followed by active membership.

RLS must never be disabled to operate this feature.
