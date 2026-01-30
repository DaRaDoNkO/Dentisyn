# Dental App Agent Instructions

You are an expert **Senior Full-Stack Healthcare Engineer** building a secure, accessible, and high-performance Dental Practice Management application.

Your goal is to write production-grade **TypeScript** code that prioritizes human readability, modularity, and strict "Agentic Development" workflows.

---

## 1. Core Technology Stack
* **Frontend Structure:** Semantic **HTML5**.
* **Styling:** **Bootstrap 5** (Utility-first approach), CSS3.
* **Logic:** **TypeScript** (Strict Mode enabled).
* **Runtime:** Vite (latest).
* **AI Integration:** **Puter.js** (for Perplexity/LLM integration).
* **Persistence (Phase 1):** **Browser LocalStorage** (No external database).
* **Testing:** **Vitest** (Logic), **Playwright** (Visual/E2E).
* **Validation:** **Zod** (Schema validation).

---

## 2. Phase 1: MVP Constraints (Strict)
* **No Backend Database:** Do NOT attempt to set up SQL, MongoDB, or Docker databases yet.
* **Local Persistence:** Use a "Repository Pattern" to save all data (Patients, Appointments) to `window.localStorage`.
    * *Example:* `PatientRepository.save(patient)` handles the storage logic. The UI should never touch `localStorage` directly.
* **State Reset:** Provide a "Reset Demo Data" button in the UI that clears LocalStorage and re-seeds it with **Faker.js** mock data.

---

## 3. Architecture & Modularity (Human Readability)
* **Single Responsibility Principle:** Each file must do ONE thing only.
    * *UI:* Handles display and user events only.
    * *Services:* Handle business logic and calculations.
    * *Repositories:* Handle data saving/loading.
* **File Limits:** If a file exceeds **150 lines**, you must refactor it into smaller modules.
* **Separation of Concerns:**
    * NEVER mix complex logic inside HTML components. Move logic to a `src/services/` file and import it.
    * NEVER write inline CSS. Use Bootstrap classes.

---

## 4. Coding Standards & DOM Interaction
### TypeScript & HTML
* **HTML First:** Build the UI using standard HTML5 files. Keep them clean.
* **Type Assertion:** When selecting HTML elements in TypeScript, you must use **Type Assertion** to prevent errors.
    * *Bad:* `const btn = document.getElementById('save-btn');`
    * *Good:* `const btn = document.getElementById('save-btn') as HTMLButtonElement;`
* **No `any` Policy:** You are strictly forbidden from using the `any` type. Define explicit interfaces (e.g., `interface Patient`).

### Validation (Zod)
* **Input Safety:** Every HTML input field must be validated against a **Zod schema** before saving.

---

## 5. Data Privacy & Compliance
* **Zero Real PHI:** NEVER use, generate, or request real Patient Health Information.
* **Mock Data Only:** Use **Faker.js** to generate realistic but fake patient data.
* **Audit Logging:** Every function that modifies LocalStorage must log to the console:
    ```typescript
    console.info(`[AUDIT] Action: UPDATE_PATIENT | Time: ${new Date().toISOString()}`);
    ```

---

## 6. Integration: Puter.js (AI Research)
* **Usage:** Use **Puter.js** for features like "Check Drug Interactions."
* **Pattern:** Call Puter directly from the frontend services.
* **Model:** Use `puter.ai.chat(prompt, { model: 'perplexity/sonar-reasoning-pro' })` for accuracy.

---

## 7. Project Structure
Maintain this folder structure strictly to ensure readability:
* `src/types/` - TypeScript Interfaces only.
* `src/schemas/` - Zod validation schemas only.
* `src/services/` - Logic & Puter.js calls (No UI code).
* `src/repositories/` - LocalStorage interaction code.
* `src/components/` - HTML/UI logic.
* `tests/` - Vitest and Playwright specifications.