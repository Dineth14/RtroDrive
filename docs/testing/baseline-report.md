# Baseline execution report

Date: 2026-09-20. Commit inspected: `3ae074f` on initial `main`. This report precedes major implementation.

| Check | Actual result |
|---|---|
| Initial worktree | Clean before running build |
| Repository inventory | 9,083 tracked files; includes `node_modules`, `dist`, TypeScript build metadata; no root `.gitignore` |
| Runtime | Node.js 22.13.1; Vite 6.4.3 from installed lockfile |
| `npm.cmd test` | FAIL: first check expects 9 visual profiles, actual count is 13; remaining checks not reached |
| `npm.cmd run build` | PASS: TypeScript project build and Vite production bundle |
| `npm.cmd run dev -- --host 127.0.0.1` | Started successfully on port 5173 |
| HTTP GET `/` | 200 |
| Browser visual inspection | NOT RUN: Browser runtime setup completed, but returned `No browser is available`; discovery returned empty list |
| PowerShell `npm` alias | Blocked by local `.ps1` execution policy; `npm.cmd` works without changing policy |
| Embedded/mobile/hardware tooling | ESP-IDF, Flutter, KiCad CLI and CMake not on PATH; MinGW GCC 6.3.0 available; Python WindowsApps alias unusable, real install discovery needed |
| Hardware/vehicle tests | NOT RUN: no attached hardware or vehicle test evidence provided |

Build output changed already-tracked generated files. Repository hygiene work must untrack generated directories without deleting the installed working dependencies. Browser behavior, real display frame rate, electrical protection, BLE and vehicle compatibility have not been validated by these checks.
