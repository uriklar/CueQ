# CueQ Conjugation Module Task

Create a new branch `feature/conjugation-practice` and implement a French verb conjugation practice module.

## Goal
Add a self-contained module inspired by Conjuu app where users:
1. Select a verb + tense 
2. Fill in all 6 pronoun forms
3. Check answers with green/red feedback
4. Get scored

## New files needed:
- `app/data/verbsData.ts` - offline conjugation data for 80+ common verbs
- `app/screens/ConjugationSetup.tsx` - session config screen  
- `app/screens/ConjugationPractice.tsx` - main practice UI
- `app/utils/conjugationUtils.ts` - helper functions
- `app/conjugation-setup.tsx` + `app/conjugation-practice.tsx` - route files

## Modified files:
- `app/index.tsx` - add Conjugation button
- `app/_layout.tsx` - register new routes

## Key requirements:
- Use existing app theme (colors, spacing, typography)
- 6 tenses: présent, imparfait, futur, passé_composé, conditionnel, subjonctif
- Copy shortcut button (copies previous field to current)
- Proper passé composé with être/avoir auxiliaries
- Normalize answers (ignore case, whitespace, handle elision)

## Finish with:
- git add -A && git commit -m "feat: add French conjugation practice module"
- git push -u origin feature/conjugation-practice  
- gh pr create with proper title/description
- openclaw system event --text "Done: CueQ conjugation PR created" --mode now
