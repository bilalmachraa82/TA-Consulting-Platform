# PRD v2.0: TA Consulting Platform (Consultancy OS)

**Date:** 2026-01-05
**Version:** 2.0
**Status:** DRAFT
**Based on:** Meeting Transcription with Fernando (YouTube)

## 1. Executive Summary & Vision
The project is pivoting from a standalone "RAG Tool" to an integrated **Consultancy Operating System**. The goal is to build a "constant" partnership platform rather than a one-off software delivery. This system will bridge the gap between "Bitrix Power Users" (Fernando) and "Excel Users" (Pedro), acting as an AI layer that automates lead matching, marketing planning, and technical drafting.

### Core Value Proposition
1.  **Revitalize "Dead" Data:** Turn the 24,000+ static company records in Bitrix into active leads by automatically matching them with new daily notices.
2.  **Conversational Funnel:** Replace friction-heavy forms with a progressive chatbot that gives value *before* asking for contact details.
3.  **AI Style Transfer:** Move beyond generic text generation to writing that mimics the specific "TA Consulting Style" based on 291 historical applications.

---

## 2. Business Requirements (The "Partnership" Model)
*   **Recurring Value:** The system must justify a monthly retainer/partnership fee, not just a setup fee.
*   **Constant Optimization:** The platform should support "continuous learning" – as new funds appear (e.g., "Sistemas de Incentivos"), the model is updated without code rewrites.
*   **Usage Monitoring:** System must track API usage/value generated to support the business case for the recurring fee.

---

## 3. Key Functional Modules

### 3.1. Strategic Matchmaking Engine (The "Cash Cow")
*   **Input:** New scraped Aviso (e.g., "Inovação Produtiva").
*   **Process:** 
    1.  Parse eligibility criteria (CAE, Region, Size).
    2.  Query Bitrix DB (24k companies).
    3.  Calculate "Match Score" (0-100%).
*   **Output:** "Top 100 Prospects" list with detailed reasons.
*   **Automation:** Suggest "Marketing Mix" (e.g., "Send Email Template A to these 50 companies", "Target LinkedIn Ads to this sector").
    *   *Goal:* Replace the manual "Green/Red" color coding in Fernando's Excel strategy.

### 3.2. Bitrix24 Deep Integration
*   **Why:** To avoid "Excel Hell" and leverage the existing Single Source of Truth.
*   **Sync Logic:**
    *   **Inbound:** Leads from Chatbot -> Bitrix Leads.
    *   **Outbound:** Company Data (NIF, Sector, Size) -> Matchmaking Engine.
    *   **Pipeline Awareness:** AI needs to know if a client is in "Fase 0" or "A aguardar aviso" to give context-aware answers.

### 3.3. Conversational Lead Funnel (Progressive UI)
*   **Problem:** "If you ask for everything upfront, they leave."
*   **Solution:** A progressive chat interface.
    1.  **Give Value First:** "Tell me your sector -> Here are 3 open funds."
    2.  **Ask Later:** "Want a full report? What is your NIF?"
*   **Implementation:** `ChatWizard` component (Implemented).

### 3.4. AI Technical Writer (Style Transfer)
*   **Asset:** 291 Google Drive documents ("Memórias Descritivas").
*   **Goal:** Not just "write a text", but "write a text like WE do".
*   **Workflow:**
    1.  User selects a new Aviso.
    2.  User selects a similar "Reference Project" from history.
    3.  AI generates draft using the *structure* and *tone* of the reference match.

### 3.5. Website Automation (Bonus)
*   **Requirement:** "Paula currently updates the website manually."
*   **Feature:** Auto-publish "Key Facts" of new Avisos to a "Latest Opportunities" widget on the public site.

---

## 4. Technical Architecture Changes
*   **Backend:** Node.js/Prisma with direct Bitrix REST API hooks.
*   **AI:** Gemini 1.5 Pro (large context for 291 docs) + Abacus/OpenRouter for fast chat.
*   **Data:** 
    *   **Hot Data:** Postgres (Notices, Matches, Active Leads).
    *   **Cold Data:** Bitrix (Company Master Records).
    *   **Documents:** Vector Store (RAG).

## 5. Development Phases (Revised)
1.  **Phase 1 (Done):** Core Bitrix Client, Matchmaking Logic, Chat Setup.
2.  **Phase 2 (Immediate):** Technical Writing Assistant (RAG Setup).
3.  **Phase 3:** Marketing Automation & Dashboard Polish.
4.  **Phase 4:** Automatic Website Updates.

---

## 6. Open Questions
*   **Bitrix Licensing:** Can we use a "webhook-only" user to save license costs?
*   **GDPR:** Consent management for automated matching (addressed in ChatWizard checkboxes).
