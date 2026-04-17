# Developer Documentation

## Framework & UI System
This project uses **shadcn/ui** to implement a brutalist design aesthetic. The available and configured UI components in the `components/ui` directory are:

- **Button**
  - *Variants:* `default`, `outline`, `secondary`, `ghost`, `destructive`, `neo`, `link`
  - *Sizes:* `default`, `xs`, `sm`, `lg`, `xl`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`
- **Badge**
  - *Variants:* `default`, `secondary`, `destructive`, `outline`
- **Input** 
- **Label** 
- **Select**
- **Table** 

## React Hooks
- **`useDebounce<T>(value: T, delay?: number): T`**
  A hook that delays the update of a state value. It exists in the system to improve performance by limiting the rate of function executions, commonly used for search inputs to prevent making API calls on every keystroke.

## Helper Methods & Utilities

### Utility Functions (`lib/utils.ts` & `lib/utils`)
- **`cn(...inputs: ClassValue[])`**
  Safely merges Tailwind CSS classes using `clsx` and `tailwind-merge`.
- **`formatError(error: any): string`**
  Parses varying error formats and returns a formatted string message.
- **`levenshteinDistance(s1: string, s2: string): number`**
  Calculates the edit distance between two strings, useful for fuzzy queries.
- **`findSimilarStrings(target: string, possibilities: string[], threshold?: number): string[]`**
  Finds strings similar to the target out of a list of possibilities, based on the Levenshtein distance threshold.

### App Utilities
- **`getBrutalistEmailTemplate(title: string, body: string, linkText?: string, linkUrl?: string)`** (`lib/email-templates.ts`)
  Generates a raw brutalist-themed HTML template string for email notifications.
