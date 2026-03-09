# CueQ Conjugation Practice Module — Implementation Plan

## Branch
```bash
git checkout -b feature/conjugation-practice
```

---

## New Files

### 1. `app/data/verbsData.ts`

Offline conjugation dataset. Full structure:

```typescript
export type TenseKey = "présent" | "imparfait" | "futur" | "passé_composé" | "conditionnel" | "subjonctif";
export type PronounKey = "je" | "tu" | "il" | "nous" | "vous" | "ils";
export type ConjugationTable = Record<TenseKey, Record<PronounKey, string>>;

export const VERBS_DATA: Record<string, ConjugationTable> = {
  "être": {
    présent:       { je: "suis",   tu: "es",     il: "est",   nous: "sommes", vous: "êtes",   ils: "sont"    },
    imparfait:     { je: "étais",  tu: "étais",  il: "était", nous: "étions", vous: "étiez",  ils: "étaient" },
    futur:         { je: "serai",  tu: "seras",  il: "sera",  nous: "serons", vous: "serez",  ils: "seront"  },
    passé_composé: { je: "j'ai été", tu: "tu as été", il: "il a été", nous: "nous avons été", vous: "vous avez été", ils: "ils ont été" },
    conditionnel:  { je: "serais", tu: "serais", il: "serait", nous: "serions", vous: "seriez", ils: "seraient" },
    subjonctif:    { je: "sois",   tu: "sois",   il: "soit",  nous: "soyons", vous: "soyez",  ils: "soient"  },
  },
  "avoir": {
    présent:       { je: "ai",     tu: "as",     il: "a",     nous: "avons",  vous: "avez",   ils: "ont"     },
    imparfait:     { je: "avais",  tu: "avais",  il: "avait", nous: "avions", vous: "aviez",  ils: "avaient" },
    futur:         { je: "aurai",  tu: "auras",  il: "aura",  nous: "aurons", vous: "aurez",  ils: "auront"  },
    passé_composé: { je: "j'ai eu", tu: "tu as eu", il: "il a eu", nous: "nous avons eu", vous: "vous avez eu", ils: "ils ont eu" },
    conditionnel:  { je: "aurais", tu: "aurais", il: "aurait", nous: "aurions", vous: "auriez", ils: "auraient" },
    subjonctif:    { je: "aie",    tu: "aies",   il: "ait",   nous: "ayons",  vous: "ayez",   ils: "aient"   },
  },
  "aller": {
    présent:       { je: "vais",   tu: "vas",    il: "va",    nous: "allons", vous: "allez",  ils: "vont"    },
    imparfait:     { je: "allais", tu: "allais", il: "allait", nous: "allions", vous: "alliez", ils: "allaient" },
    futur:         { je: "irai",   tu: "iras",   il: "ira",   nous: "irons",  vous: "irez",   ils: "iront"   },
    passé_composé: { je: "je suis allé", tu: "tu es allé", il: "il est allé", nous: "nous sommes allés", vous: "vous êtes allés", ils: "ils sont allés" },
    conditionnel:  { je: "irais",  tu: "irais",  il: "irait", nous: "irions", vous: "iriez",  ils: "iraient" },
    subjonctif:    { je: "aille",  tu: "ailles", il: "aille", nous: "allions", vous: "alliez", ils: "aillent" },
  },
  "faire": {
    présent:       { je: "fais",   tu: "fais",   il: "fait",  nous: "faisons", vous: "faites", ils: "font"   },
    imparfait:     { je: "faisais", tu: "faisais", il: "faisait", nous: "faisions", vous: "faisiez", ils: "faisaient" },
    futur:         { je: "ferai",  tu: "feras",  il: "fera",  nous: "ferons", vous: "ferez",  ils: "feront"  },
    passé_composé: { je: "j'ai fait", tu: "tu as fait", il: "il a fait", nous: "nous avons fait", vous: "vous avez fait", ils: "ils ont fait" },
    conditionnel:  { je: "ferais", tu: "ferais", il: "ferait", nous: "ferions", vous: "feriez", ils: "feraient" },
    subjonctif:    { je: "fasse",  tu: "fasses", il: "fasse", nous: "fassions", vous: "fassiez", ils: "fassent" },
  },
  "vouloir": {
    présent:       { je: "veux",   tu: "veux",   il: "veut",  nous: "voulons", vous: "voulez", ils: "veulent" },
    imparfait:     { je: "voulais", tu: "voulais", il: "voulait", nous: "voulions", vous: "vouliez", ils: "voulaient" },
    futur:         { je: "voudrai", tu: "voudras", il: "voudra", nous: "voudrons", vous: "voudrez", ils: "voudront" },
    passé_composé: { je: "j'ai voulu", tu: "tu as voulu", il: "il a voulu", nous: "nous avons voulu", vous: "vous avez voulu", ils: "ils ont voulu" },
    conditionnel:  { je: "voudrais", tu: "voudrais", il: "voudrait", nous: "voudrions", vous: "voudriez", ils: "voudraient" },
    subjonctif:    { je: "veuille", tu: "veuilles", il: "veuille", nous: "voulions", vous: "vouliez", ils: "veuillent" },
  },
  "pouvoir": {
    présent:       { je: "peux",   tu: "peux",   il: "peut",  nous: "pouvons", vous: "pouvez", ils: "peuvent" },
    imparfait:     { je: "pouvais", tu: "pouvais", il: "pouvait", nous: "pouvions", vous: "pouviez", ils: "pouvaient" },
    futur:         { je: "pourrai", tu: "pourras", il: "pourra", nous: "pourrons", vous: "pourrez", ils: "pourront" },
    passé_composé: { je: "j'ai pu", tu: "tu as pu", il: "il a pu", nous: "nous avons pu", vous: "vous avez pu", ils: "ils ont pu" },
    conditionnel:  { je: "pourrais", tu: "pourrais", il: "pourrait", nous: "pourrions", vous: "pourriez", ils: "pourraient" },
    subjonctif:    { je: "puisse", tu: "puisses", il: "puisse", nous: "puissions", vous: "puissiez", ils: "puissent" },
  },
  "savoir": {
    présent:       { je: "sais",   tu: "sais",   il: "sait",  nous: "savons", vous: "savez",  ils: "savent"  },
    imparfait:     { je: "savais", tu: "savais", il: "savait", nous: "savions", vous: "saviez", ils: "savaient" },
    futur:         { je: "saurai", tu: "sauras", il: "saura", nous: "saurons", vous: "saurez", ils: "sauront" },
    passé_composé: { je: "j'ai su", tu: "tu as su", il: "il a su", nous: "nous avons su", vous: "vous avez su", ils: "ils ont su" },
    conditionnel:  { je: "saurais", tu: "saurais", il: "saurait", nous: "saurions", vous: "sauriez", ils: "sauraient" },
    subjonctif:    { je: "sache",  tu: "saches", il: "sache", nous: "sachions", vous: "sachiez", ils: "sachent" },
  },
  "venir": {
    présent:       { je: "viens",  tu: "viens",  il: "vient", nous: "venons", vous: "venez",  ils: "viennent" },
    imparfait:     { je: "venais", tu: "venais", il: "venait", nous: "venions", vous: "veniez", ils: "venaient" },
    futur:         { je: "viendrai", tu: "viendras", il: "viendra", nous: "viendrons", vous: "viendrez", ils: "viendront" },
    passé_composé: { je: "je suis venu", tu: "tu es venu", il: "il est venu", nous: "nous sommes venus", vous: "vous êtes venus", ils: "ils sont venus" },
    conditionnel:  { je: "viendrais", tu: "viendrais", il: "viendrait", nous: "viendrions", vous: "viendriez", ils: "viendraient" },
    subjonctif:    { je: "vienne", tu: "viennes", il: "vienne", nous: "venions", vous: "veniez", ils: "viennent" },
  },
  "voir": {
    présent:       { je: "vois",   tu: "vois",   il: "voit",  nous: "voyons", vous: "voyez",  ils: "voient"  },
    imparfait:     { je: "voyais", tu: "voyais", il: "voyait", nous: "voyions", vous: "voyiez", ils: "voyaient" },
    futur:         { je: "verrai", tu: "verras", il: "verra", nous: "verrons", vous: "verrez", ils: "verront" },
    passé_composé: { je: "j'ai vu", tu: "tu as vu", il: "il a vu", nous: "nous avons vu", vous: "vous avez vu", ils: "ils ont vu" },
    conditionnel:  { je: "verrais", tu: "verrais", il: "verrait", nous: "verrions", vous: "verriez", ils: "verraient" },
    subjonctif:    { je: "voie",   tu: "voies",  il: "voie",  nous: "voyions", vous: "voyiez", ils: "voient"  },
  },
  "prendre": {
    présent:       { je: "prends", tu: "prends", il: "prend", nous: "prenons", vous: "prenez", ils: "prennent" },
    imparfait:     { je: "prenais", tu: "prenais", il: "prenait", nous: "prenions", vous: "preniez", ils: "prenaient" },
    futur:         { je: "prendrai", tu: "prendras", il: "prendra", nous: "prendrons", vous: "prendrez", ils: "prendront" },
    passé_composé: { je: "j'ai pris", tu: "tu as pris", il: "il a pris", nous: "nous avons pris", vous: "vous avez pris", ils: "ils ont pris" },
    conditionnel:  { je: "prendrais", tu: "prendrais", il: "prendrait", nous: "prendrions", vous: "prendriez", ils: "prendraient" },
    subjonctif:    { je: "prenne", tu: "prennes", il: "prenne", nous: "prenions", vous: "preniez", ils: "prennent" },
  },
  "parler": {
    présent:       { je: "parle",  tu: "parles", il: "parle", nous: "parlons", vous: "parlez", ils: "parlent" },
    imparfait:     { je: "parlais", tu: "parlais", il: "parlait", nous: "parlions", vous: "parliez", ils: "parlaient" },
    futur:         { je: "parlerai", tu: "parleras", il: "parlera", nous: "parlerons", vous: "parlerez", ils: "parleront" },
    passé_composé: { je: "j'ai parlé", tu: "tu as parlé", il: "il a parlé", nous: "nous avons parlé", vous: "vous avez parlé", ils: "ils ont parlé" },
    conditionnel:  { je: "parlerais", tu: "parlerais", il: "parlerait", nous: "parlerions", vous: "parleriez", ils: "parleraient" },
    subjonctif:    { je: "parle",  tu: "parles", il: "parle", nous: "parlions", vous: "parliez", ils: "parlent" },
  },
  "finir": {
    présent:       { je: "finis",  tu: "finis",  il: "finit", nous: "finissons", vous: "finissez", ils: "finissent" },
    imparfait:     { je: "finissais", tu: "finissais", il: "finissait", nous: "finissions", vous: "finissiez", ils: "finissaient" },
    futur:         { je: "finirai", tu: "finiras", il: "finira", nous: "finirons", vous: "finirez", ils: "finiront" },
    passé_composé: { je: "j'ai fini", tu: "tu as fini", il: "il a fini", nous: "nous avons fini", vous: "vous avez fini", ils: "ils ont fini" },
    conditionnel:  { je: "finirais", tu: "finirais", il: "finirait", nous: "finirions", vous: "finiriez", ils: "finiraient" },
    subjonctif:    { je: "finisse", tu: "finisses", il: "finisse", nous: "finissions", vous: "finissiez", ils: "finissent" },
  },
  "aimer": {
    présent:       { je: "aime",   tu: "aimes",  il: "aime",  nous: "aimons", vous: "aimez",  ils: "aiment"  },
    imparfait:     { je: "aimais", tu: "aimais", il: "aimait", nous: "aimions", vous: "aimiez", ils: "aimaient" },
    futur:         { je: "aimerai", tu: "aimeras", il: "aimera", nous: "aimerons", vous: "aimerez", ils: "aimeront" },
    passé_composé: { je: "j'ai aimé", tu: "tu as aimé", il: "il a aimé", nous: "nous avons aimé", vous: "vous avez aimé", ils: "ils ont aimé" },
    conditionnel:  { je: "aimerais", tu: "aimerais", il: "aimerait", nous: "aimerions", vous: "aimeriez", ils: "aimeraient" },
    subjonctif:    { je: "aime",   tu: "aimes",  il: "aime",  nous: "aimions", vous: "aimiez", ils: "aiment"  },
  },
  "manger": {
    présent:       { je: "mange",  tu: "manges", il: "mange", nous: "mangeons", vous: "mangez", ils: "mangent" },
    imparfait:     { je: "mangeais", tu: "mangeais", il: "mangeait", nous: "mangions", vous: "mangiez", ils: "mangeaient" },
    futur:         { je: "mangerai", tu: "mangeras", il: "mangera", nous: "mangerons", vous: "mangerez", ils: "mangeront" },
    passé_composé: { je: "j'ai mangé", tu: "tu as mangé", il: "il a mangé", nous: "nous avons mangé", vous: "vous avez mangé", ils: "ils ont mangé" },
    conditionnel:  { je: "mangerais", tu: "mangerais", il: "mangerait", nous: "mangerions", vous: "mangeriez", ils: "mangeraient" },
    subjonctif:    { je: "mange",  tu: "manges", il: "mange", nous: "mangions", vous: "mangiez", ils: "mangent" },
  },
  "partir": {
    présent:       { je: "pars",   tu: "pars",   il: "part",  nous: "partons", vous: "partez", ils: "partent" },
    imparfait:     { je: "partais", tu: "partais", il: "partait", nous: "partions", vous: "partiez", ils: "partaient" },
    futur:         { je: "partirai", tu: "partiras", il: "partira", nous: "partirons", vous: "partirez", ils: "partiront" },
    passé_composé: { je: "je suis parti", tu: "tu es parti", il: "il est parti", nous: "nous sommes partis", vous: "vous êtes partis", ils: "ils sont partis" },
    conditionnel:  { je: "partirais", tu: "partirais", il: "partirait", nous: "partirions", vous: "partiriez", ils: "partiraient" },
    subjonctif:    { je: "parte",  tu: "partes", il: "parte", nous: "partions", vous: "partiez", ils: "partent" },
  },
  "sortir": {
    présent:       { je: "sors",   tu: "sors",   il: "sort",  nous: "sortons", vous: "sortez", ils: "sortent" },
    imparfait:     { je: "sortais", tu: "sortais", il: "sortait", nous: "sortions", vous: "sortiez", ils: "sortaient" },
    futur:         { je: "sortirai", tu: "sortiras", il: "sortira", nous: "sortirons", vous: "sortirez", ils: "sortiront" },
    passé_composé: { je: "je suis sorti", tu: "tu es sorti", il: "il est sorti", nous: "nous sommes sortis", vous: "vous êtes sortis", ils: "ils sont sortis" },
    conditionnel:  { je: "sortirais", tu: "sortirais", il: "sortirait", nous: "sortirions", vous: "sortiriez", ils: "sortiraient" },
    subjonctif:    { je: "sorte",  tu: "sortes", il: "sorte", nous: "sortions", vous: "sortiez", ils: "sortent" },
  },
  "mettre": {
    présent:       { je: "mets",   tu: "mets",   il: "met",   nous: "mettons", vous: "mettez", ils: "mettent" },
    imparfait:     { je: "mettais", tu: "mettais", il: "mettait", nous: "mettions", vous: "mettiez", ils: "mettaient" },
    futur:         { je: "mettrai", tu: "mettras", il: "mettra", nous: "mettrons", vous: "mettrez", ils: "mettront" },
    passé_composé: { je: "j'ai mis", tu: "tu as mis", il: "il a mis", nous: "nous avons mis", vous: "vous avez mis", ils: "ils ont mis" },
    conditionnel:  { je: "mettrais", tu: "mettrais", il: "mettrait", nous: "mettrions", vous: "mettriez", ils: "mettraient" },
    subjonctif:    { je: "mette",  tu: "mettes", il: "mette", nous: "mettions", vous: "mettiez", ils: "mettent" },
  },
  "écrire": {
    présent:       { je: "écris",  tu: "écris",  il: "écrit", nous: "écrivons", vous: "écrivez", ils: "écrivent" },
    imparfait:     { je: "écrivais", tu: "écrivais", il: "écrivait", nous: "écrivions", vous: "écriviez", ils: "écrivaient" },
    futur:         { je: "écrirai", tu: "écriras", il: "écrira", nous: "écrirons", vous: "écrirez", ils: "écriront" },
    passé_composé: { je: "j'ai écrit", tu: "tu as écrit", il: "il a écrit", nous: "nous avons écrit", vous: "vous avez écrit", ils: "ils ont écrit" },
    conditionnel:  { je: "écrirais", tu: "écrirais", il: "écrirait", nous: "écririons", vous: "écririez", ils: "écriraient" },
    subjonctif:    { je: "écrive",  tu: "écrives", il: "écrive", nous: "écrivions", vous: "écriviez", ils: "écrivent" },
  },
  "lire": {
    présent:       { je: "lis",    tu: "lis",    il: "lit",   nous: "lisons",  vous: "lisez",  ils: "lisent"  },
    imparfait:     { je: "lisais", tu: "lisais", il: "lisait", nous: "lisions", vous: "lisiez", ils: "lisaient" },
    futur:         { je: "lirai",  tu: "liras",  il: "lira",  nous: "lirons",  vous: "lirez",  ils: "liront"  },
    passé_composé: { je: "j'ai lu", tu: "tu as lu", il: "il a lu", nous: "nous avons lu", vous: "vous avez lu", ils: "ils ont lu" },
    conditionnel:  { je: "lirais", tu: "lirais", il: "lirait", nous: "lirions", vous: "liriez", ils: "liraient" },
    subjonctif:    { je: "lise",   tu: "lises",  il: "lise",  nous: "lisions", vous: "lisiez", ils: "lisent"  },
  },
  "dire": {
    présent:       { je: "dis",    tu: "dis",    il: "dit",   nous: "disons",  vous: "dites",  ils: "disent"  },
    imparfait:     { je: "disais", tu: "disais", il: "disait", nous: "disions", vous: "disiez", ils: "disaient" },
    futur:         { je: "dirai",  tu: "diras",  il: "dira",  nous: "dirons",  vous: "direz",  ils: "diront"  },
    passé_composé: { je: "j'ai dit", tu: "tu as dit", il: "il a dit", nous: "nous avons dit", vous: "vous avez dit", ils: "ils ont dit" },
    conditionnel:  { je: "dirais", tu: "dirais", il: "dirait", nous: "dirions", vous: "diriez", ils: "diraient" },
    subjonctif:    { je: "dise",   tu: "dises",  il: "dise",  nous: "disions", vous: "disiez", ils: "disent"  },
  },
  "comprendre": {
    présent:       { je: "comprends", tu: "comprends", il: "comprend", nous: "comprenons", vous: "comprenez", ils: "comprennent" },
    imparfait:     { je: "comprenais", tu: "comprenais", il: "comprenait", nous: "comprenions", vous: "compreniez", ils: "comprenaient" },
    futur:         { je: "comprendrai", tu: "comprendras", il: "comprendra", nous: "comprendrons", vous: "comprendrez", ils: "comprendront" },
    passé_composé: { je: "j'ai compris", tu: "tu as compris", il: "il a compris", nous: "nous avons compris", vous: "vous avez compris", ils: "ils ont compris" },
    conditionnel:  { je: "comprendrais", tu: "comprendrais", il: "comprendrait", nous: "comprendrions", vous: "comprendriez", ils: "comprendraient" },
    subjonctif:    { je: "comprenne", tu: "comprennes", il: "comprenne", nous: "comprenions", vous: "compreniez", ils: "comprennent" },
  },
  "boire": {
    présent:       { je: "bois",   tu: "bois",   il: "boit",  nous: "buvons",  vous: "buvez",  ils: "boivent" },
    imparfait:     { je: "buvais", tu: "buvais", il: "buvait", nous: "buvions", vous: "buviez", ils: "buvaient" },
    futur:         { je: "boirai", tu: "boiras", il: "boira", nous: "boirons", vous: "boirez", ils: "boiront" },
    passé_composé: { je: "j'ai bu", tu: "tu as bu", il: "il a bu", nous: "nous avons bu", vous: "vous avez bu", ils: "ils ont bu" },
    conditionnel:  { je: "boirais", tu: "boirais", il: "boirait", nous: "boirions", vous: "boiriez", ils: "boiraient" },
    subjonctif:    { je: "boive",  tu: "boives", il: "boive", nous: "buvions", vous: "buviez",  ils: "boivent" },
  },
  "connaître": {
    présent:       { je: "connais", tu: "connais", il: "connaît", nous: "connaissons", vous: "connaissez", ils: "connaissent" },
    imparfait:     { je: "connaissais", tu: "connaissais", il: "connaissait", nous: "connaissions", vous: "connaissiez", ils: "connaissaient" },
    futur:         { je: "connaîtrai", tu: "connaîtras", il: "connaîtra", nous: "connaîtrons", vous: "connaîtrez", ils: "connaîtront" },
    passé_composé: { je: "j'ai connu", tu: "tu as connu", il: "il a connu", nous: "nous avons connu", vous: "vous avez connu", ils: "ils ont connu" },
    conditionnel:  { je: "connaîtrais", tu: "connaîtrais", il: "connaîtrait", nous: "connaîtrions", vous: "connaîtriez", ils: "connaîtraient" },
    subjonctif:    { je: "connaisse", tu: "connaisses", il: "connaisse", nous: "connaissions", vous: "connaissiez", ils: "connaissent" },
  },
  "tenir": {
    présent:       { je: "tiens",  tu: "tiens",  il: "tient", nous: "tenons",  vous: "tenez",  ils: "tiennent" },
    imparfait:     { je: "tenais", tu: "tenais", il: "tenait", nous: "tenions", vous: "teniez", ils: "tenaient" },
    futur:         { je: "tiendrai", tu: "tiendras", il: "tiendra", nous: "tiendrons", vous: "tiendrez", ils: "tiendront" },
    passé_composé: { je: "j'ai tenu", tu: "tu as tenu", il: "il a tenu", nous: "nous avons tenu", vous: "vous avez tenu", ils: "ils ont tenu" },
    conditionnel:  { je: "tiendrais", tu: "tiendrais", il: "tiendrait", nous: "tiendrions", vous: "tiendriez", ils: "tiendraient" },
    subjonctif:    { je: "tienne", tu: "tiennes", il: "tienne", nous: "tenions", vous: "teniez", ils: "tiennent" },
  },
  "courir": {
    présent:       { je: "cours",  tu: "cours",  il: "court", nous: "courons", vous: "courez", ils: "courent" },
    imparfait:     { je: "courais", tu: "courais", il: "courait", nous: "courions", vous: "couriez", ils: "couraient" },
    futur:         { je: "courrai", tu: "courras", il: "courra", nous: "courrons", vous: "courrez", ils: "courront" },
    passé_composé: { je: "j'ai couru", tu: "tu as couru", il: "il a couru", nous: "nous avons couru", vous: "vous avez couru", ils: "ils ont couru" },
    conditionnel:  { je: "courrais", tu: "courrais", il: "courrait", nous: "courrions", vous: "courriez", ils: "courraient" },
    subjonctif:    { je: "coure",  tu: "coures", il: "coure", nous: "courions", vous: "couriez", ils: "courent" },
  },
  "vivre": {
    présent:       { je: "vis",    tu: "vis",    il: "vit",   nous: "vivons",  vous: "vivez",  ils: "vivent"  },
    imparfait:     { je: "vivais", tu: "vivais", il: "vivait", nous: "vivions", vous: "viviez", ils: "vivaient" },
    futur:         { je: "vivrai", tu: "vivras", il: "vivra", nous: "vivrons", vous: "vivrez", ils: "vivront" },
    passé_composé: { je: "j'ai vécu", tu: "tu as vécu", il: "il a vécu", nous: "nous avons vécu", vous: "vous avez vécu", ils: "ils ont vécu" },
    conditionnel:  { je: "vivrais", tu: "vivrais", il: "vivrait", nous: "vivrions", vous: "vivriez", ils: "vivraient" },
    subjonctif:    { je: "vive",   tu: "vives",  il: "vive",  nous: "vivions", vous: "viviez", ils: "vivent"  },
  },
  "devoir": {
    présent:       { je: "dois",   tu: "dois",   il: "doit",  nous: "devons",  vous: "devez",  ils: "doivent" },
    imparfait:     { je: "devais", tu: "devais", il: "devait", nous: "devions", vous: "deviez", ils: "devaient" },
    futur:         { je: "devrai", tu: "devras", il: "devra", nous: "devrons", vous: "devrez", ils: "devront" },
    passé_composé: { je: "j'ai dû", tu: "tu as dû", il: "il a dû", nous: "nous avons dû", vous: "vous avez dû", ils: "ils ont dû" },
    conditionnel:  { je: "devrais", tu: "devrais", il: "devrait", nous: "devrions", vous: "devriez", ils: "devraient" },
    subjonctif:    { je: "doive",  tu: "doives", il: "doive", nous: "devions", vous: "deviez",  ils: "doivent" },
  },
  "recevoir": {
    présent:       { je: "reçois", tu: "reçois", il: "reçoit", nous: "recevons", vous: "recevez", ils: "reçoivent" },
    imparfait:     { je: "recevais", tu: "recevais", il: "recevait", nous: "recevions", vous: "receviez", ils: "recevaient" },
    futur:         { je: "recevrai", tu: "recevras", il: "recevra", nous: "recevrons", vous: "recevrez", ils: "recevront" },
    passé_composé: { je: "j'ai reçu", tu: "tu as reçu", il: "il a reçu", nous: "nous avons reçu", vous: "vous avez reçu", ils: "ils ont reçu" },
    conditionnel:  { je: "recevrais", tu: "recevrais", il: "recevrait", nous: "recevrions", vous: "recevriez", ils: "recevraient" },
    subjonctif:    { je: "reçoive", tu: "reçoives", il: "reçoive", nous: "recevions", vous: "receviez", ils: "reçoivent" },
  },
  "ouvrir": {
    présent:       { je: "ouvre",  tu: "ouvres", il: "ouvre", nous: "ouvrons", vous: "ouvrez", ils: "ouvrent" },
    imparfait:     { je: "ouvrais", tu: "ouvrais", il: "ouvrait", nous: "ouvrions", vous: "ouvriez", ils: "ouvraient" },
    futur:         { je: "ouvrirai", tu: "ouvriras", il: "ouvrira", nous: "ouvrirons", vous: "ouvrirez", ils: "ouvriront" },
    passé_composé: { je: "j'ai ouvert", tu: "tu as ouvert", il: "il a ouvert", nous: "nous avons ouvert", vous: "vous avez ouvert", ils: "ils ont ouvert" },
    conditionnel:  { je: "ouvrirais", tu: "ouvrirais", il: "ouvrirait", nous: "ouvririons", vous: "ouvririez", ils: "ouvriraient" },
    subjonctif:    { je: "ouvre",  tu: "ouvres", il: "ouvre", nous: "ouvrions", vous: "ouvriez", ils: "ouvrent" },
  },
  "suivre": {
    présent:       { je: "suis",   tu: "suis",   il: "suit",  nous: "suivons", vous: "suivez", ils: "suivent" },
    imparfait:     { je: "suivais", tu: "suivais", il: "suivait", nous: "suivions", vous: "suiviez", ils: "suivaient" },
    futur:         { je: "suivrai", tu: "suivras", il: "suivra", nous: "suivrons", vous: "suivrez", ils: "suivront" },
    passé_composé: { je: "j'ai suivi", tu: "tu as suivi", il: "il a suivi", nous: "nous avons suivi", vous: "vous avez suivi", ils: "ils ont suivi" },
    conditionnel:  { je: "suivrais", tu: "suivrais", il: "suivrait", nous: "suivrions", vous: "suivriez", ils: "suivraient" },
    subjonctif:    { je: "suive",  tu: "suives", il: "suive", nous: "suivions", vous: "suiviez", ils: "suivent" },
  },
  "conduire": {
    présent:       { je: "conduis", tu: "conduis", il: "conduit", nous: "conduisons", vous: "conduisez", ils: "conduisent" },
    imparfait:     { je: "conduisais", tu: "conduisais", il: "conduisait", nous: "conduisions", vous: "conduisiez", ils: "conduisaient" },
    futur:         { je: "conduirai", tu: "conduiras", il: "conduira", nous: "conduirons", vous: "conduirez", ils: "conduiront" },
    passé_composé: { je: "j'ai conduit", tu: "tu as conduit", il: "il a conduit", nous: "nous avons conduit", vous: "vous avez conduit", ils: "ils ont conduit" },
    conditionnel:  { je: "conduirais", tu: "conduirais", il: "conduirait", nous: "conduirions", vous: "conduiriez", ils: "conduiraient" },
    subjonctif:    { je: "conduise", tu: "conduises", il: "conduise", nous: "conduisions", vous: "conduisiez", ils: "conduisent" },
  },
  "rire": {
    présent:       { je: "ris",    tu: "ris",    il: "rit",   nous: "rions",   vous: "riez",   ils: "rient"   },
    imparfait:     { je: "riais",  tu: "riais",  il: "riait", nous: "riions",  vous: "riiez",  ils: "riaient" },
    futur:         { je: "rirai",  tu: "riras",  il: "rira",  nous: "rirons",  vous: "rirez",  ils: "riront"  },
    passé_composé: { je: "j'ai ri", tu: "tu as ri", il: "il a ri", nous: "nous avons ri", vous: "vous avez ri", ils: "ils ont ri" },
    conditionnel:  { je: "rirais", tu: "rirais", il: "rirait", nous: "ririons", vous: "ririez", ils: "riraient" },
    subjonctif:    { je: "rie",    tu: "ries",   il: "rie",   nous: "riions",  vous: "riiez",  ils: "rient"   },
  },
  "craindre": {
    présent:       { je: "crains", tu: "crains", il: "craint", nous: "craignons", vous: "craignez", ils: "craignent" },
    imparfait:     { je: "craignais", tu: "craignais", il: "craignait", nous: "craignions", vous: "craigniez", ils: "craignaient" },
    futur:         { je: "craindrai", tu: "craindras", il: "craindra", nous: "craindrons", vous: "craindrez", ils: "craindront" },
    passé_composé: { je: "j'ai craint", tu: "tu as craint", il: "il a craint", nous: "nous avons craint", vous: "vous avez craint", ils: "ils ont craint" },
    conditionnel:  { je: "craindrais", tu: "craindrais", il: "craindrait", nous: "craindrions", vous: "craindriez", ils: "craindraient" },
    subjonctif:    { je: "craigne", tu: "craignes", il: "craigne", nous: "craignions", vous: "craigniez", ils: "craignent" },
  },
  "croire": {
    présent:       { je: "crois",  tu: "crois",  il: "croit", nous: "croyons", vous: "croyez", ils: "croient" },
    imparfait:     { je: "croyais", tu: "croyais", il: "croyait", nous: "croyions", vous: "croyiez", ils: "croyaient" },
    futur:         { je: "croirai", tu: "croiras", il: "croira", nous: "croirons", vous: "croirez", ils: "croiront" },
    passé_composé: { je: "j'ai cru", tu: "tu as cru", il: "il a cru", nous: "nous avons cru", vous: "vous avez cru", ils: "ils ont cru" },
    conditionnel:  { je: "croirais", tu: "croirais", il: "croirait", nous: "croirions", vous: "croiriez", ils: "croiraient" },
    subjonctif:    { je: "croie",  tu: "croies", il: "croie", nous: "croyions", vous: "croyiez", ils: "croient" },
  },
  "dormir": {
    présent:       { je: "dors",   tu: "dors",   il: "dort",  nous: "dormons", vous: "dormez", ils: "dorment" },
    imparfait:     { je: "dormais", tu: "dormais", il: "dormait", nous: "dormions", vous: "dormiez", ils: "dormaient" },
    futur:         { je: "dormirai", tu: "dormiras", il: "dormira", nous: "dormirons", vous: "dormirez", ils: "dormiront" },
    passé_composé: { je: "j'ai dormi", tu: "tu as dormi", il: "il a dormi", nous: "nous avons dormi", vous: "vous avez dormi", ils: "ils ont dormi" },
    conditionnel:  { je: "dormirais", tu: "dormirais", il: "dormirait", nous: "dormirions", vous: "dormiriez", ils: "dormiraient" },
    subjonctif:    { je: "dorme",  tu: "dormes", il: "dorme", nous: "dormions", vous: "dormiez", ils: "dorment" },
  },
  "attendre": {
    présent:       { je: "attends", tu: "attends", il: "attend", nous: "attendons", vous: "attendez", ils: "attendent" },
    imparfait:     { je: "attendais", tu: "attendais", il: "attendait", nous: "attendions", vous: "attendiez", ils: "attendaient" },
    futur:         { je: "attendrai", tu: "attendras", il: "attendra", nous: "attendrons", vous: "attendrez", ils: "attendront" },
    passé_composé: { je: "j'ai attendu", tu: "tu as attendu", il: "il a attendu", nous: "nous avons attendu", vous: "vous avez attendu", ils: "ils ont attendu" },
    conditionnel:  { je: "attendrais", tu: "attendrais", il: "attendrait", nous: "attendrions", vous: "attendriez", ils: "attendraient" },
    subjonctif:    { je: "attende", tu: "attendes", il: "attende", nous: "attendions", vous: "attendiez", ils: "attendent" },
  },
  "vendre": {
    présent:       { je: "vends",  tu: "vends",  il: "vend",  nous: "vendons", vous: "vendez", ils: "vendent" },
    imparfait:     { je: "vendais", tu: "vendais", il: "vendait", nous: "vendions", vous: "vendiez", ils: "vendaient" },
    futur:         { je: "vendrai", tu: "vendras", il: "vendra", nous: "vendrons", vous: "vendrez", ils: "vendront" },
    passé_composé: { je: "j'ai vendu", tu: "tu as vendu", il: "il a vendu", nous: "nous avons vendu", vous: "vous avez vendu", ils: "ils ont vendu" },
    conditionnel:  { je: "vendrais", tu: "vendrais", il: "vendrait", nous: "vendrions", vous: "vendriez", ils: "vendraient" },
    subjonctif:    { je: "vende",  tu: "vendes", il: "vende", nous: "vendions", vous: "vendiez", ils: "vendent" },
  },
};

export const TENSE_LABELS: Record<TenseKey, string> = {
  présent: "Présent",
  imparfait: "Imparfait",
  futur: "Futur simple",
  passé_composé: "Passé composé",
  conditionnel: "Conditionnel présent",
  subjonctif: "Subjonctif présent",
};

export const TENSE_DESCRIPTIONS: Record<TenseKey, string> = {
  présent: "Used for current or habitual actions. — Je mange = I eat / I am eating",
  imparfait: "Used for ongoing/habitual past actions and descriptions. — Je mangeais = I was eating / I used to eat",
  futur: "Used for future actions. — Je mangerai = I will eat",
  passé_composé: "Used for completed past actions. Uses avoir or être + past participle. — J'ai mangé = I ate / I have eaten",
  conditionnel: "Used for hypothetical or polite requests. — Je mangerais = I would eat",
  subjonctif: "Used after expressions of doubt, emotion, necessity, or certain conjunctions. — Il faut que je mange = I need to eat",
};

export const PRONOUN_LABELS: Record<PronounKey, string> = {
  je: "je / j'",
  tu: "tu",
  il: "il / elle / on",
  nous: "nous",
  vous: "vous",
  ils: "ils / elles",
};

export const PRONOUN_KEYS: PronounKey[] = ["je", "tu", "il", "nous", "vous", "ils"];
```

---

### 2. `app/utils/conjugationUtils.ts`

```typescript
import { TenseKey, PronounKey, VERBS_DATA, PRONOUN_KEYS } from "../data/verbsData";

export function normalizeAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\u2019/g, "'") // right single quotation mark → apostrophe
    .replace(/'/g, "'");
}

export function checkAnswer(userInput: string, correct: string): boolean {
  return normalizeAnswer(userInput) === normalizeAnswer(correct);
}

export function getVerbsForSession(tense: TenseKey, count: number): string[] {
  const available = Object.keys(VERBS_DATA).filter(v => VERBS_DATA[v]?.[tense]);
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, available.length));
}

export const emptyAnswers = (): Record<PronounKey, string> =>
  Object.fromEntries(PRONOUN_KEYS.map(p => [p, ""])) as Record<PronounKey, string>;

export const emptyResults = (): Record<PronounKey, boolean | null> =>
  Object.fromEntries(PRONOUN_KEYS.map(p => [p, null])) as Record<PronounKey, boolean | null>;
```

---

### 3. `app/screens/ConjugationSetup.tsx`

```typescript
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from "react-native";
import { router } from "expo-router";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { VERBS_DATA, TENSE_LABELS, TenseKey } from "../data/verbsData";

const TENSES: TenseKey[] = ["présent", "imparfait", "futur", "passé_composé", "conditionnel", "subjonctif"];
const SESSION_SIZES = [5, 10, 15];

export function ConjugationSetup() {
  const [selectedTense, setSelectedTense] = useState<TenseKey | null>(null);
  const [sessionSize, setSessionSize] = useState(5);
  const [search, setSearch] = useState("");

  const verbs = Object.keys(VERBS_DATA).filter(v =>
    search === "" || v.toLowerCase().includes(search.toLowerCase())
  );

  const canStart = selectedTense !== null;

  const handleStart = () => {
    if (!selectedTense) return;
    router.push({
      pathname: "/conjugation-practice",
      params: { tense: selectedTense, sessionSize: String(sessionSize) },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Conjugation Practice 🇫🇷</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Tense picker */}
        <Text style={styles.sectionLabel}>Choose a tense</Text>
        <View style={styles.pillRow}>
          {TENSES.map(t => (
            <Pressable
              key={t}
              onPress={() => setSelectedTense(t)}
              style={[styles.pill, selectedTense === t && styles.pillSelected]}
            >
              <Text style={[styles.pillText, selectedTense === t && styles.pillTextSelected]}>
                {TENSE_LABELS[t]}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Session size */}
        <Text style={styles.sectionLabel}>Session size</Text>
        <View style={styles.chipRow}>
          {SESSION_SIZES.map(n => (
            <Pressable
              key={n}
              onPress={() => setSessionSize(n)}
              style={[styles.chip, sessionSize === n && styles.chipSelected]}
            >
              <Text style={[styles.chipText, sessionSize === n && styles.chipTextSelected]}>
                {n} verbs
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Start button */}
      <Pressable
        onPress={handleStart}
        disabled={!canStart}
        style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
      >
        <Text style={styles.startBtnText}>START</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral50 },
  header: { padding: spacing[4], paddingTop: spacing[12], borderBottomWidth: 1, borderColor: colors.neutral200 },
  backBtn: { marginBottom: spacing[2] },
  backText: { color: colors.primary, fontSize: 16 },
  title: { fontSize: 22, fontWeight: "700", color: colors.neutral900 },
  scroll: { flex: 1, padding: spacing[4] },
  sectionLabel: { fontSize: 14, fontWeight: "600", color: colors.neutral500, marginTop: spacing[5], marginBottom: spacing[2], textTransform: "uppercase", letterSpacing: 0.5 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  pill: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: 20, borderWidth: 1.5, borderColor: colors.neutral200, backgroundColor: colors.surface },
  pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 14, color: colors.neutral700 },
  pillTextSelected: { color: colors.surface, fontWeight: "600" },
  chipRow: { flexDirection: "row", gap: spacing[2] },
  chip: { flex: 1, paddingVertical: spacing[2], borderRadius: 8, borderWidth: 1.5, borderColor: colors.neutral200, backgroundColor: colors.surface, alignItems: "center" },
  chipSelected: { backgroundColor: colors.primarySurface, borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.neutral700 },
  chipTextSelected: { color: colors.primary, fontWeight: "600" },
  startBtn: { margin: spacing[4], padding: spacing[4], borderRadius: 12, backgroundColor: colors.primary, alignItems: "center" },
  startBtnDisabled: { backgroundColor: colors.neutral300 },
  startBtnText: { color: colors.surface, fontSize: 17, fontWeight: "700", letterSpacing: 0.5 },
});
```

---

### 4. `app/screens/ConjugationPractice.tsx`

```typescript
import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import {
  VERBS_DATA, TENSE_LABELS, TENSE_DESCRIPTIONS, PRONOUN_LABELS, PRONOUN_KEYS, TenseKey, PronounKey
} from "../data/verbsData";
import {
  checkAnswer, getVerbsForSession, emptyAnswers, emptyResults
} from "../utils/conjugationUtils";

export function ConjugationPractice() {
  const { tense, sessionSize } = useLocalSearchParams<{ tense: string; sessionSize: string }>();
  const tenseKey = tense as TenseKey;
  const size = Number(sessionSize) || 5;

  const [sessionVerbs, setSessionVerbs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<PronounKey, string>>(emptyAnswers());
  const [results, setResults] = useState<Record<PronounKey, boolean | null>>(emptyResults());
  const [isChecked, setIsChecked] = useState(false);
  const [sessionScore, setSessionScore] = useState<{ verb: string; correct: number }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showTenseInfo, setShowTenseInfo] = useState(false);

  useEffect(() => {
    const verbs = getVerbsForSession(tenseKey, size);
    setSessionVerbs(verbs);
  }, []);

  const currentVerb = sessionVerbs[currentIndex] ?? "";
  const correctTable = VERBS_DATA[currentVerb]?.[tenseKey];

  const checkAllAnswers = () => {
    if (!correctTable) return;
    const newResults = {} as Record<PronounKey, boolean>;
    PRONOUN_KEYS.forEach(p => {
      newResults[p] = checkAnswer(answers[p], correctTable[p]);
    });
    setResults(newResults);
    setIsChecked(true);
  };

  const advance = () => {
    const correctCount = Object.values(results).filter(Boolean).length;
    const newScore = [...sessionScore, { verb: currentVerb, correct: correctCount }];
    setSessionScore(newScore);

    if (currentIndex + 1 >= sessionVerbs.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex(i => i + 1);
      setAnswers(emptyAnswers());
      setResults(emptyResults());
      setIsChecked(false);
    }
  };

  const reset = () => {
    const verbs = getVerbsForSession(tenseKey, size);
    setSessionVerbs(verbs);
    setCurrentIndex(0);
    setAnswers(emptyAnswers());
    setResults(emptyResults());
    setIsChecked(false);
    setSessionScore([]);
    setIsComplete(false);
  };

  // Score screen
  if (isComplete) {
    const totalCorrect = sessionScore.reduce((sum, s) => sum + s.correct, 0);
    const total = sessionScore.length * 6;
    const pct = Math.round((totalCorrect / total) * 100);
    return (
      <View style={styles.container}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Session Complete! 🎉</Text>
          <Text style={styles.scoreBig}>{pct}%</Text>
          <Text style={styles.scoreSubtitle}>{totalCorrect} / {total} forms correct</Text>
          {sessionScore.map((s, i) => (
            <View key={i} style={styles.scoreRow}>
              <Text style={styles.scoreVerb}>{s.verb}</Text>
              <Text style={styles.scoreCount}>{s.correct}/6</Text>
            </View>
          ))}
        </View>
        <View style={styles.scoreButtons}>
          <Pressable onPress={reset} style={styles.btnSecondary}>
            <Text style={styles.btnSecondaryText}>Try Again</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>New Session</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!currentVerb) return null;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.progress}>{currentIndex + 1} / {sessionVerbs.length}</Text>
        <Text style={styles.headerTitle}>Conjugation</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeBtn}>✕</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Verb */}
        <Text style={styles.verbTitle}>{currentVerb}</Text>

        {/* Tense badge */}
        <Pressable style={styles.tenseBadge} onPress={() => setShowTenseInfo(true)}>
          <Text style={styles.tenseBadgeText}>{TENSE_LABELS[tenseKey]}</Text>
          <Text style={styles.infoIcon}>  ℹ️</Text>
        </Pressable>

        {/* Input rows */}
        {PRONOUN_KEYS.map((p, idx) => {
          const result = results[p];
          const correct = correctTable?.[p] ?? "";
          return (
            <View key={p} style={styles.inputRow}>
              <Text style={styles.pronounLabel}>{PRONOUN_LABELS[p]}</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={[
                    styles.input,
                    result === true && styles.inputCorrect,
                    result === false && styles.inputWrong,
                  ]}
                  value={answers[p]}
                  onChangeText={val => setAnswers(prev => ({ ...prev, [p]: val }))}
                  editable={!isChecked}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="..."
                  placeholderTextColor={colors.neutral300}
                />
                {result === false && (
                  <Text style={styles.correctAnswer}>{correct}</Text>
                )}
              </View>
            </View>
          );
        })}

        {/* Copy button */}
        {!isChecked && (
          <Pressable
            style={styles.copyBtn}
            onPress={() => setAnswers(prev => ({ ...prev, ils: prev.je }))}
          >
            <Text style={styles.copyBtnText}>Copy je → ils/elles</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Check / Next button */}
      <Pressable
        style={styles.mainBtn}
        onPress={isChecked ? advance : checkAllAnswers}
      >
        <Text style={styles.mainBtnText}>{isChecked ? "NEXT →" : "CHECK ANSWERS"}</Text>
      </Pressable>

      {/* Tense info modal */}
      <Modal visible={showTenseInfo} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowTenseInfo(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{TENSE_LABELS[tenseKey]}</Text>
            <Text style={styles.modalBody}>{TENSE_DESCRIPTIONS[tenseKey]}</Text>
            <Pressable onPress={() => setShowTenseInfo(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Got it</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral50 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing[4], paddingTop: spacing[12], borderBottomWidth: 1, borderColor: colors.neutral200 },
  progress: { fontSize: 14, color: colors.neutral500, width: 50 },
  headerTitle: { fontSize: 16, fontWeight: "600", color: colors.neutral900 },
  closeBtn: { fontSize: 18, color: colors.neutral500, width: 50, textAlign: "right" },
  scroll: { flex: 1, padding: spacing[4] },
  verbTitle: { fontSize: 32, fontWeight: "700", color: colors.primary, textAlign: "center", marginVertical: spacing[4] },
  tenseBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: spacing[5] },
  tenseBadgeText: { fontSize: 14, fontWeight: "600", color: colors.neutral700, backgroundColor: colors.neutral100, paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: 12 },
  infoIcon: { fontSize: 14 },
  inputRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: spacing[3] },
  pronounLabel: { width: 90, paddingTop: 10, fontSize: 14, color: colors.neutral500, fontStyle: "italic" },
  inputWrap: { flex: 1 },
  input: { borderWidth: 1.5, borderColor: colors.neutral200, borderRadius: 8, padding: spacing[3], fontSize: 16, color: colors.neutral900, backgroundColor: colors.surface },
  inputCorrect: { borderColor: colors.success, backgroundColor: colors.successLight },
  inputWrong: { borderColor: colors.danger, backgroundColor: colors.dangerLight },
  correctAnswer: { fontSize: 13, color: colors.danger, marginTop: 2, paddingLeft: 2 },
  copyBtn: { alignSelf: "center", marginVertical: spacing[2], padding: spacing[2] },
  copyBtnText: { fontSize: 13, color: colors.primaryLight },
  mainBtn: { margin: spacing[4], padding: spacing[4], borderRadius: 12, backgroundColor: colors.primary, alignItems: "center" },
  mainBtnText: { color: colors.surface, fontSize: 17, fontWeight: "700" },
  scoreCard: { flex: 1, padding: spacing[6], alignItems: "center" },
  scoreTitle: { fontSize: 24, fontWeight: "700", color: colors.neutral900, marginBottom: spacing[2] },
  scoreBig: { fontSize: 64, fontWeight: "700", color: colors.primary, marginBottom: spacing[2] },
  scoreSubtitle: { fontSize: 16, color: colors.neutral500, marginBottom: spacing[6] },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", paddingVertical: spacing[2], borderBottomWidth: 1, borderColor: colors.neutral100 },
  scoreVerb: { fontSize: 16, color: colors.neutral700 },
  scoreCount: { fontSize: 16, fontWeight: "600", color: colors.primary },
  scoreButtons: { flexDirection: "row", gap: spacing[3], padding: spacing[4] },
  btnSecondary: { flex: 1, padding: spacing[4], borderRadius: 12, borderWidth: 1.5, borderColor: colors.primary, alignItems: "center" },
  btnSecondaryText: { color: colors.primary, fontSize: 16, fontWeight: "600" },
  btnPrimary: { flex: 1, padding: spacing[4], borderRadius: 12, backgroundColor: colors.primary, alignItems: "center" },
  btnPrimaryText: { color: colors.surface, fontSize: 16, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "center", alignItems: "center" },
  modalCard: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing[6], margin: spacing[6], width: "85%" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: colors.neutral900, marginBottom: spacing[3] },
  modalBody: { fontSize: 15, color: colors.neutral700, lineHeight: 22, marginBottom: spacing[4] },
  modalClose: { alignSelf: "flex-end" },
  modalCloseText: { color: colors.primary, fontWeight: "600", fontSize: 15 },
});
```

---

### 5. `app/conjugation-setup.tsx` (route file)

```typescript
import { ConjugationSetup } from "./screens/ConjugationSetup";
export default ConjugationSetup;
```

### 6. `app/conjugation-practice.tsx` (route file)

```typescript
import { ConjugationPractice } from "./screens/ConjugationPractice";
export default ConjugationPractice;
```

---

## Modified Files

### `app/_layout.tsx` — add to `<Stack>`:

```typescript
<Stack.Screen name="conjugation-setup" options={{ headerShown: false }} />
<Stack.Screen name="conjugation-practice" options={{ headerShown: false }} />
```

### `app/index.tsx` — add button alongside existing practice button:

Find where the practice/dashboard toggle button is rendered and add:

```typescript
<Pressable
  onPress={() => router.push("/conjugation-setup")}
  style={styles.conjugationButton}
>
  <Text style={styles.conjugationButtonText}>🇫🇷 Conjugation</Text>
</Pressable>
```

Add to styles:
```typescript
conjugationButton: {
  backgroundColor: colors.accentLight,
  borderRadius: 12,
  padding: spacing[3],
  alignItems: "center",
  marginTop: spacing[2],
},
conjugationButtonText: {
  color: colors.neutral900,
  fontWeight: "600",
  fontSize: 15,
},
```

---

## Git + PR

```bash
git add -A
git commit -m "feat: add French conjugation practice module"
git push -u origin feature/conjugation-practice
gh pr create \
  --title "feat: French conjugation practice module (Conjuu-style)" \
  --body "## What this adds

A self-contained conjugation practice module:

- **30 verbs** with offline conjugation data (6 tenses each), all common irregular verbs included
- **Setup screen**: pick tense, session size (5/10/15)
- **Practice screen**: fill in all 6 pronoun forms, check answers with green/red feedback
- **Copy shortcut**: tap to copy je form into ils/elles field
- **Score summary** at end of session with per-verb breakdown

### Tenses covered
Présent, Imparfait, Futur simple, Passé composé, Conditionnel présent, Subjonctif présent

### Files added
- \`app/data/verbsData.ts\` — offline conjugation dataset (30 verbs × 6 tenses)
- \`app/screens/ConjugationSetup.tsx\` — session config UI
- \`app/screens/ConjugationPractice.tsx\` — practice UI with scoring
- \`app/utils/conjugationUtils.ts\` — answer checking helpers
- \`app/conjugation-setup.tsx\` + \`app/conjugation-practice.tsx\` — route entry points

### Files modified
- \`app/index.tsx\` — added Conjugation entry button
- \`app/_layout.tsx\` — registered new routes" \
  --base main
```
