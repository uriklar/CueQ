# Refactor Plan for `app/components`

This plan proposes **incremental**, **test-driven** changes that migrate the current weekend-project code towards a production-ready, sustainable architecture that follows **SOLID**, Clean Architecture and general React-Native best practices.

---

## 1. High-level Goals

1. **Single-Responsibility** – every component should render UI only; business / data logic moves to hooks or services.
2. **Open / Closed** – components become extensible by composition rather than edits to their internals.
3. **Liskov Substitution** – shared interfaces for common pieces (e.g. modal props) to guarantee interchangeability.
4. **Interface Segregation** – small, intention-revealing interfaces instead of huge prop objects.
5. **Dependency Inversion** – UI depends on abstractions; e.g. Sentence provider injected vs hard-coded `getExampleSentence`.
6. **Reusability & Testability** – colocate tests, add Storybook stories (out-of-scope to implement here but keep in mind).
7. **Folder Structure** – adopt feature-first folders with `index.ts`, `use*.ts`, `styles.ts`, and `types.ts`.

---

## 2. Component-by-Component Analysis & Action Items

| Component                                                   | Problems                                                                                                                | Actions                                                                                                                                                     |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AddWordModal**                                            | • Mixed presentation + form state logic. <br/>• Gender button duplication. <br/>• Uses many inline styles in same file. | 1. Extract `useAddWordForm()` hook for state / validation. <br/>2. Extract `GenderToggle` sub-component. <br/>3. Move `styles` to `AddWordModal.styles.ts`. |
| **BulkImportModal**                                         | • Parsing / validation logic inside component. <br/>• Alert import duplicates.                                          | 1. Create `bulkImport.service.ts` with `parseWords(json)` that returns `Either<Error, Word[]>`. <br/>2. Component becomes thin; handles UI + calls service. |
| **CardStack**                                               | • 330 lines – too big. <br/>• Holds navigation / example sentence logic / layout / swipe state together.                | 1. Extract `useCardStack()` hook (index, reveal, sentence, swipe). <br/>2. Extract `BottomBar`, `TopControls`, `ExampleSection`.                            |
| 2. Inject `SentenceProvider` instead of hard-coded service. |
| **SearchInput**                                             | OK. Just move styles file.                                                                                              |
| **WordCard**                                                | • Speaker & gender mark could be independent.                                                                           | 1. Extract `GenderMark` util + `SpeakerButton` component. <br/>2. Move styles.                                                                              |
| **WordList**                                                | • `renderItem` defined inside component each render. <br/>• Swipe delete logic inside renderItem.                       | 1. Extract `WordListItem` component (memoized). <br/>2. Extract `DifficultyFilter` out to separate file.                                                    |

---

## 3. Cross-cutting Improvements

1. **Hooks folder** – `app/hooks`. All custom hooks live here.
2. **Services folder** – already exists; ensure all network / storage logic lives here.
3. **UI primitives** – `app/ui` for styled reusable building blocks (Button, ModalHeader, etc.).
4. **Types Consolidation** – ensure `app/types/index.ts` exports common interfaces used across components.
5. **Testing Setup** – add Jest + React Native Testing Library (not implemented in this PR).
6. **ESLint / Prettier** – ensure code style.

---

## 4. Refactor Roadmap (This PR)

Phase 1 – **Preparations**

1. Create folders `app/hooks`, `app/ui`, `app/components/AddWordModal` etc.
2. Move each component to its own folder with `index.tsx`, `styles.ts`.

Phase 2 – **Logic Extraction**

1. Implement `useAddWordForm` & `GenderToggle`.
2. Implement `bulkImport.service` and adjust modal.
3. Implement `useCardStack` + `ExampleSection`, `BottomBar`, `TopControls`.
4. Implement `WordListItem` & `DifficultyFilter` component files.

Phase 3 – **Dependency Injection**

1. Create `SentenceProvider` context with default using `getExampleSentence`.
2. Inject into `useCardStack`.

Phase 4 – **Polish & Types**

1. Update imports, paths, barrel files.
2. Run ESLint / Type check.

(Testing, storybook, CI are future work outside the scope of this refactor.)

---

## 5. Acceptance Criteria

- App compiles & all functionality identical from end-user perspective.
- No component file exceeds **200** LOC; presentational components < **150** LOC.
- All business logic lives in hooks or services.
- No direct `StyleSheet.create` inside component file (except very small ones).
- All newly created files are unit-tested (future work).

---

_Author: AI Refactor Bot – June 2025_
