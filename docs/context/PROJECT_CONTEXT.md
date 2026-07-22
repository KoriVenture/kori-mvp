# Kori MVP — Project Context

## Purpose

Kori is a demonstration platform for milestone-based startup investment and controlled fund release.

It is not currently intended to handle real client funds or provide regulated investment services.

## Main actors

### Investor

- Reviews investment opportunities.
- Deposits test funds.
- Tracks investment ownership.
- Reviews milestone progress.

### Startup

- Creates or manages a project.
- Defines milestones.
- Uploads supporting evidence.
- Tracks milestone decisions and released funds.

### Fund Manager

- Reviews projects.
- Reviews submitted evidence.
- Uses AI analysis as decision support.
- Participates in approval workflows.

### Operations and compliance

These responsibilities may exist in the architecture, but the first MVP focuses on the three primary application profiles:

- Investor
- Startup
- Fund Manager

## Core workflow

```text
Investor
   |
   v
Deposit
   |
   v
Escrow contract
   |
   v
Startup submits milestone evidence
   |
   v
Document storage
   |
   v
AI analysis
   |
   v
Human review
   |
   v
Safe multisig approval
   |
   v
Release or rejection