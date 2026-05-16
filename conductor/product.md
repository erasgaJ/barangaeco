# BarangaEco — Product Guide

## Overview

BarangaEco is a digital barangay management system that replaces paper-based processes with a web-based admin dashboard and mobile API. It serves local government units (barangays) in the Philippines.

## Target Users

| User | Interface | Role |
|------|-----------|------|
| Barangay admins/staff | Web (admin dashboard) | Manage all records, approve requests, monitor waste routes |
| Barangay officials | Web (admin dashboard) | Review reports, oversee operations |
| Residents | Mobile app (API) | Submit document requests, file complaints, view announcements |
| Waste collectors | Mobile app (API) | View assigned schedules, update collection status in the field |

## Problems Solved

1. **Manual paper-based records** — Digitizes resident records, collection schedules, and document requests that were previously handled on paper.
2. **Inefficient waste routing** — Provides collectors with clear digital schedules and gives admins real-time status visibility.
3. **Slow document processing** — Residents request barangay documents digitally and receive status updates without visiting the office.
4. **Unstructured complaint handling** — Provides a structured channel for residents to file, track, and escalate complaints.

## Key Features

### Admin Web App
- Dashboard with stats and today's waste routes
- Resident Records — full CRUD management
- Waste Collection Schedules — weekly calendar view with collector assignments
- Collector Management — add, update, deactivate collectors
- Document Request approvals — approve or reject with reason
- Complaint tracking — update status and resolution
- Announcements — publish and manage community announcements

### Mobile API (Sanctum token auth)
- **Resident:** dashboard overview, submit/track document requests, file/track complaints, view announcements
- **Collector:** view assigned schedules, update collection statuses in the field

## Success Metrics

- Admins can process document requests without paper forms
- Collectors receive and update their schedules digitally
- Residents can track their requests and complaints from a mobile app
- All critical modules covered by automated tests (80%+ coverage)
