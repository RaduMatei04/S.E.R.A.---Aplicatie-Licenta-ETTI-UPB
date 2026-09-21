# SERA Frontend — Index

Vault Obsidian cu documentația de arhitectură a proiectului **SERA** (frontend UI-first pentru monitorizarea/configurarea unei sere inteligente, lucrare de licență). Nu există încă integrare cu backend/ESP32 — vezi [[Straturi-Aplicatie]] pentru cum e gândit stratul viitor.

Regulile sursă de adevăr rămân `CLAUDE.md` și `AGENTS_SERA.md` din rădăcina repo-ului; notele de aici sunt un rezumat navigabil, nu o duplicare completă.

## Arhitectură

- [[Stack-Tehnologii]] — stack-ul fix (React, Vite, Tailwind, shadcn, TanStack, Keycloak) și ce e interzis
- [[Straturi-Aplicatie]] — layering-ul aplicației, de la primitive UI până la granița API/auth
- [[Reguli-Ownership]] — unde trebuie să trăiască o componentă și convențiile de naming

## Rute

- [[Harta-Rute]] — tabelul complet de rute și diagrama routing-ului

## Features

- [[Overview]] — index-ul feature-urilor din `src/features/`
- [[Start]] · [[Home]] · [[Status]] · [[Charts]] · [[History]] · [[Settings]] · [[Profile]] · [[Theme]]

## Auth

- [[Keycloak]] — fluxul de autentificare (AuthProvider, useAuth)

## Componente UI

- [[Shadcn-Primitives]] — primitivele shadcn/Radix deja instalate în `src/components/ui/`
