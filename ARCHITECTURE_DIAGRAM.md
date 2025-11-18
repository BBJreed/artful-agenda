\# Artful Agenda Architecture Diagram



\## System Overview

```

┌─────────────────────────────────────────────────────────────────────────────┐

│                          ARTFUL AGENDA APPLICATION                          │

└─────────────────────────────────────────────────────────────────────────────┘



┌─────────────────────────────────────────────────────────────────────────────┐

│                           PRESENTATION LAYER                                │

├─────────────────────────────────────────────────────────────────────────────┤

│                                                                             │

│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │

│  │   App.tsx        │  │ CalendarCanvas   │  │ HandwritingInput │        │

│  │                  │  │                  │  │                  │        │

│  │ - Orchestration  │  │ - SVG Grid       │  │ - Pointer Events │        │

│  │ - Service Init   │  │ - Layer Composite│  │ - Bézier Convert │        │

│  │ - UI Controls    │  │ - Zoom/Pan       │  │ - Vector Storage │        │

│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘        │

│           │                     │                      │                   │

└───────────┼─────────────────────┼──────────────────────┼───────────────────┘

&nbsp;           │                     │                      │

&nbsp;           ▼                     ▼                      ▼

┌─────────────────────────────────────────────────────────────────────────────┐

│                            STATE MANAGEMENT                                 │

├─────────────────────────────────────────────────────────────────────────────┤

│                                                                             │

│                         Zustand Store (appStore.ts)                         │

│  ┌─────────────────────────────────────────────────────────────────┐      │

│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │      │

│  │  │  Events  │  │Decoration│  │Handwriting│  │  Tasks   │       │      │

│  │  │  Layer   │  │  Layer   │  │  Layer    │  │  Layer   │       │      │

│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │      │

│  │                                                                  │      │

│  │  Visibility Controls  │  Theme State  │  Sync Queue            │      │

│  └─────────────────────────────────────────────────────────────────┘      │

│                                    │                                       │

└────────────────────────────────────┼───────────────────────────────────────┘

&nbsp;                                    │

&nbsp;                                    ▼

┌─────────────────────────────────────────────────────────────────────────────┐

│                             SERVICE LAYER                                   │

├─────────────────────────────────────────────────────────────────────────────┤

│                                                                             │

│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐              │

│  │ CalendarSync   │  │ RealtimeSync   │  │ Subscription   │              │

│  │                │  │                │  │                │              │

│  │ - API Calls    │  │ - WebSocket    │  │ - JWT Auth     │              │

│  │ - Normalize    │  │ - Polling      │  │ - Feature Gate │              │

│  │ - Conflict Res │  │ - Broadcast    │  │ - Quota Check  │              │

│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘              │

│          │                   │                    │                        │

│  ┌───────┴────────┐  ┌───────┴────────┐  ┌───────┴────────┐              │

│  │ ThemeManager   │  │  PDFExport     │  │                │              │

│  │                │  │                │  │                │              │

│  │ - Apply Theme  │  │ - Vector PDF   │  │                │              │

│  │ - CSS Vars     │  │ - Layer Render │  │                │              │

│  │ - Font Load    │  │ - High Res     │  │                │              │

│  └────────────────┘  └────────────────┘  └────────────────┘              │

│                                                                             │

└────────┬───────────────────────┬──────────────────────────┬────────────────┘

&nbsp;        │                       │                          │

&nbsp;        ▼                       ▼                          ▼

┌─────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐

│  External APIs  │  │  WebSocket Server   │  │   Auth Backend      │

│                 │  │                     │  │                     │

│ - Google Cal    │  │ - Real-time Sync    │  │ - JWT Generation    │

│ - Apple Cal     │  │ - Room Management   │  │ - Token Validation  │

│ - Outlook       │  │ - Broadcast         │  │ - User Management   │

└─────────────────┘  └─────────────────────┘  └─────────────────────┘

```



\## Data Flow Diagram

```

USER INTERACTION

&nbsp;     │

&nbsp;     ▼

┌─────────────┐

│  UI Event   │ ─────┐

└─────────────┘      │

&nbsp;                    │

&nbsp;                    ▼

&nbsp;             ┌────────────┐

&nbsp;             │   Store    │ ◄──── Memory State

&nbsp;             │  Actions   │

&nbsp;             └──────┬─────┘

&nbsp;                    │

&nbsp;        ┌───────────┼───────────┐

&nbsp;        │           │           │

&nbsp;        ▼           ▼           ▼

&nbsp;   ┌────────┐  ┌────────┐  ┌────────┐

&nbsp;   │ Layer  │  │ Layer  │  │ Layer  │

&nbsp;   │ Update │  │ Update │  │ Update │

&nbsp;   └───┬────┘  └───┬────┘  └───┬────┘

&nbsp;       │           │           │

&nbsp;       └───────────┼───────────┘

&nbsp;                   │

&nbsp;                   ▼

&nbsp;           ┌───────────────┐

&nbsp;           │  Sync Queue   │

&nbsp;           └───────┬───────┘

&nbsp;                   │

&nbsp;       ┌───────────┴───────────┐

&nbsp;       │                       │

&nbsp;       ▼                       ▼

┌───────────────┐       ┌───────────────┐

│   WebSocket   │       │  External API │

│   Broadcast   │       │    Sync       │

└───────┬───────┘       └───────┬───────┘

&nbsp;       │                       │

&nbsp;       │                       │

&nbsp;       ▼                       ▼

&nbsp; Other Devices            Remote Calendar

```



\## Layer Rendering Pipeline

```

┌─────────────────────────────────────────────────────────────────┐

│                     RENDERING PIPELINE                          │

└─────────────────────────────────────────────────────────────────┘



&nbsp;      Theme Template

&nbsp;            │

&nbsp;            ▼

&nbsp;   ┌────────────────┐

&nbsp;   │  SVG Template  │

&nbsp;   │  CSS Variables │

&nbsp;   └────────┬───────┘

&nbsp;            │

&nbsp;            ▼

&nbsp;   ┌────────────────────────────────────────┐

&nbsp;   │         LAYER COMPOSITION              │

&nbsp;   ├────────────────────────────────────────┤

&nbsp;   │                                        │

&nbsp;   │  Z-Index 0:  Background Grid (SVG)    │

&nbsp;   │  Z-Index 10: Events Layer             │

&nbsp;   │  Z-Index 20: Tasks Layer              │

&nbsp;   │  Z-Index 30-40: Decorations (sorted)  │

&nbsp;   │  Z-Index 50: Handwriting Layer (SVG)  │

&nbsp;   │                                        │

&nbsp;   └────────────────┬───────────────────────┘

&nbsp;                    │

&nbsp;                    ▼

&nbsp;           ┌────────────────┐

&nbsp;           │  Viewport      │

&nbsp;           │  Transform     │

&nbsp;           │  (Zoom/Pan)    │

&nbsp;           └────────┬───────┘

&nbsp;                    │

&nbsp;                    ▼

&nbsp;           ┌────────────────┐

&nbsp;           │   DOM Render   │

&nbsp;           └────────────────┘

```



\## Synchronization Architecture

```

┌──────────────────────────────────────────────────────────────────┐

│                    MULTI-DEVICE SYNC FLOW                        │

└──────────────────────────────────────────────────────────────────┘



Device A                WebSocket Server              Device B

&nbsp;  │                           │                          │

&nbsp;  │  Event Update             │                          │

&nbsp;  ├──────────────────────────►│                          │

&nbsp;  │                           │                          │

&nbsp;  │                      ┌────┴─────┐                   │

&nbsp;  │                      │ Validate │                   │

&nbsp;  │                      │   Auth   │                   │

&nbsp;  │                      └────┬─────┘                   │

&nbsp;  │                           │                          │

&nbsp;  │                           │  Broadcast Update        │

&nbsp;  │                           ├─────────────────────────►│

&nbsp;  │                           │                          │

&nbsp;  │                           │                     Apply Change

&nbsp;  │                           │                          │

&nbsp;  │                           │◄─────────────────────────┤

&nbsp;  │                           │      Acknowledge         │

&nbsp;  │                           │                          │

&nbsp;  │                           │                          │

&nbsp;  │  Calendar API Sync        │                          │

&nbsp;  ├──────────────────────────►│                          │

&nbsp;  │                           │                          │

&nbsp;  │       Fallback Polling    │                          │

&nbsp;  │◄──────────────────────────┤                          │

&nbsp;  │       (if WS fails)       │                          │



&nbsp;  

CONFLICT RESOLUTION:

&nbsp;  

&nbsp;  Local Change          Remote Change

&nbsp;       │                     │

&nbsp;       └──────┬──────────────┘

&nbsp;              │

&nbsp;              ▼

&nbsp;      ┌───────────────┐

&nbsp;      │   Timestamp   │

&nbsp;      │   Comparison  │

&nbsp;      └───────┬───────┘

&nbsp;              │

&nbsp;       ┌──────┴──────┐

&nbsp;       │             │

&nbsp;       ▼             ▼

&nbsp;   Newer         Older

&nbsp;  (Keep)       (Discard)

```



\## Authentication \& Authorization Flow

```

┌─────────────────────────────────────────────────────────────┐

│              SUBSCRIPTION \& FEATURE GATING                  │

└─────────────────────────────────────────────────────────────┘



User Action

&nbsp;   │

&nbsp;   ▼

┌───────────────┐

│ Feature Check │

└───────┬───────┘

&nbsp;       │

&nbsp;       ▼

┌───────────────────┐     NO      ┌──────────────┐

│ Client-Side Check ├────────────►│ Show Upgrade │

│ (JWT Features)    │             │    Prompt    │

└───────┬───────────┘             └──────────────┘

&nbsp;       │ YES

&nbsp;       ▼

┌───────────────────┐

│ Server Validation │

│  API Call + JWT   │

└───────┬───────────┘

&nbsp;       │

&nbsp;   ┌───┴────┐

&nbsp;   │        │

&nbsp;   ▼        ▼

&nbsp; VALID   INVALID

&nbsp;   │        │

&nbsp;   │        └──────► Reject + Refresh Token

&nbsp;   │

&nbsp;   ▼

Allow Feature

```



\## PDF Export Pipeline

```

┌─────────────────────────────────────────────────────────────┐

│                    PDF GENERATION FLOW                      │

└─────────────────────────────────────────────────────────────┘



User Clicks Export

&nbsp;      │

&nbsp;      ▼

┌─────────────────┐

│ Subscription    │

│ Check (Premium) │

└────────┬────────┘

&nbsp;        │

&nbsp;        ▼

┌─────────────────────────────────────┐

│    Collect Current State            │

│ - Events Layer                      │

│ - Decorations Layer                 │

│ - Handwriting Layer (Bézier Curves) │

│ - Tasks Layer                       │

│ - Active Theme                      │

└────────┬────────────────────────────┘

&nbsp;        │

&nbsp;        ▼

┌─────────────────────────────────────┐

│    High-Resolution Render           │

│ - Scale to 300 DPI                  │

│ - Apply Theme SVG Template          │

│ - Render Each Layer in Z-Order      │

│ - Convert Bézier to PDF Paths       │

└────────┬────────────────────────────┘

&nbsp;        │

&nbsp;        ▼

┌─────────────────────┐

│  PDF Document       │

│  - Vector Objects   │

│  - Embedded Fonts   │

│  - Print-Ready      │

└────────┬────────────┘

&nbsp;        │

&nbsp;        ▼

&nbsp;   Download Blob

```



\## Component Communication

```

┌─────────────────────────────────────────────────────────────┐

│              COMPONENT DATA FLOW                            │

└─────────────────────────────────────────────────────────────┘



&nbsp;       App Component

&nbsp;            │

&nbsp;   ┌────────┼────────┐

&nbsp;   │        │        │

&nbsp;   ▼        ▼        ▼

&nbsp;Canvas   Drawing  Controls

&nbsp;   │        │        │

&nbsp;   └────────┼────────┘

&nbsp;            │

&nbsp;            ▼

&nbsp;   ┌────────────────┐

&nbsp;   │  Zustand Store │ ◄──── Services (read/write)

&nbsp;   └────────────────┘

&nbsp;            │

&nbsp;   ┌────────┼────────┐

&nbsp;   │        │        │

&nbsp;   ▼        ▼        ▼

&nbsp; Layer1  Layer2  Layer3

&nbsp;   │        │        │

&nbsp;   └────────┼────────┘

&nbsp;            │

&nbsp;            ▼

&nbsp;       Composite

&nbsp;        Render

```



\## Key Architectural Principles



1\. \*\*Unidirectional Data Flow\*\*: State changes flow through store actions

2\. \*\*Layer Independence\*\*: Each layer operates without knowledge of others

3\. \*\*Service Abstraction\*\*: Business logic isolated from presentation

4\. \*\*Type Safety\*\*: TypeScript enforces contracts at compile time

5\. \*\*Progressive Enhancement\*\*: Graceful degradation when features unavailable

6\. \*\*Separation of Concerns\*\*: Clear boundaries between responsibilities

7\. \*\*Scalability\*\*: New features add without modifying existing code

