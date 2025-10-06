export interface MermaidBlockProps {
    code: string;
    mode?: "edit" | "preview";
    theme?: "default" | "dark" | "forest" | "neutral";
    width?: number;
    height?: number;
}

export interface MermaidTemplate {
    label: string;
    value: string;
    code: string;
    description: string;
}

export const MERMAID_TEMPLATES: MermaidTemplate[] = [
    {
        label: "Flowchart",
        value: "flowchart",
        description: "Display business processes and decision logic",
        code: `---
title: Business Process Flow
---
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`
    },
    {
        label: "Sequence Diagram",
        value: "sequence",
        description: "Show interaction sequences between objects",
        code: `---
title: User Login Sequence
---
sequenceDiagram
    participant A as User
    participant B as System
    participant C as Database
    
    A->>B: Login Request
    B->>C: Query User Info
    C-->>B: Return User Data
    B-->>A: Login Success`
    },
    {
        label: "Git Graph",
        value: "gitGraph",
        description: "Show Git branch and merge history",
        code: `---
title: Git Repository History
---
gitGraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Feature development"
    commit id: "Bug fix"
    checkout main
    merge develop
    commit id: "Release version"`
    },
    {
        label: "Gantt Chart",
        value: "gantt",
        description: "Project progress and task scheduling",
        code: `gantt
    title Project Schedule
    dateFormat  YYYY-MM-DD
    section Design Phase
    Requirements Analysis :done,    des1, 2024-01-01, 2024-01-10
    UI Design            :done,    des2, 2024-01-11, 2024-01-20
    section Development Phase
    Frontend Development :active,  dev1, 2024-01-21, 30d
    Backend Development  :         dev2, 2024-01-21, 25d`
    },
    {
        label: "Class Diagram",
        value: "classDiagram",
        description: "Show relationships and structure between classes",
        code: `---
title: Animal Class Hierarchy
---
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`
    },
    {
        label: "State Diagram",
        value: "stateDiagram",
        description: "Show state transitions and lifecycle",
        code: `---
title: Order Processing States
---
stateDiagram-v2
    [*] --> Pending
    Pending --> Processing : Start Processing
    Processing --> Completed : Process Complete
    Processing --> Pending : Process Failed
    Completed --> [*]`
    },
    {
        label: "Pie Chart",
        value: "pie",
        description: "Show data proportion distribution",
        code: `pie title Market Share Distribution
    "Product A" : 35
    "Product B" : 25
    "Product C" : 20
    "Others" : 20`
    },
    {
        label: "Entity Relationship Diagram",
        value: "erDiagram",
        description: "Show database entity relationships and structure",
        code: `---
title: User Management Database Schema
---
erDiagram
    USER {
        int id PK
        string username
        string email
        datetime created_at
    }
    PROFILE {
        int id PK
        int user_id FK
        string first_name
        string last_name
        string avatar_url
    }
    POST {
        int id PK
        int user_id FK
        string title
        text content
        datetime published_at
    }
    
    USER ||--|| PROFILE : has
    USER ||--o{ POST : creates`
    },
    {
        label: "User Journey",
        value: "journey",
        description: "Show user experience and interaction journey",
        code: `---
title: Online Shopping User Journey
---
journey
    title User Shopping Experience
    section Discovery
      Visit Website: 5: User
      Browse Products: 4: User
      Search Items: 3: User
    section Purchase
      Add to Cart: 5: User
      Checkout: 3: User
      Payment: 2: User
    section Post-Purchase
      Order Confirmation: 5: User
      Delivery: 4: User
      Review Product: 5: User`
    },
    {
        label: "Quadrant Chart",
        value: "quadrantChart",
        description: "Show data distribution in four quadrants",
        code: `---
title: Project Priority Matrix
---
quadrantChart
    title Reach and influence
    x-axis Low Reach --> High Reach
    y-axis Low Influence --> High Influence
    quadrant-1 We should expand
    quadrant-2 Need to promote
    quadrant-3 Re-evaluate
    quadrant-4 May be improved
    Campaign A: [0.3, 0.6]
    Campaign B: [0.45, 0.23]
    Campaign C: [0.57, 0.69]
    Campaign D: [0.78, 0.34]
    Campaign E: [0.40, 0.34]`
    },
    {
        label: "XY Chart",
        value: "xyChart-beta",
        description: "Show data relationships with X and Y coordinates",
        code: `---
title: Sales Performance Analysis
---
%%{init: {"xyChart": {"width": 700, "height": 400}}}%%
xychart-beta
    title "Sales Revenue vs Marketing Spend"
    x-axis [Jan, Feb, Mar, Apr, May, Jun]
    y-axis "Revenue (K)" 0 --> 200
    line [20, 50, 80, 120, 160, 180]
    bar [30, 60, 90, 130, 170, 190]`
    }
];

// Localize template label/description using provided dictionary
// dict is expected to be editor.dictionary?.mermaid_block?.templates
export function localizeMermaidTemplates(
    dict?: Record<string, { label?: string; description?: string }>
): MermaidTemplate[] {
    if (!dict) return MERMAID_TEMPLATES;
    return MERMAID_TEMPLATES.map((t) => {
        const key = t.value as keyof typeof dict;
        const entry = dict[key] as { label?: string; description?: string } | undefined;
        const label = entry?.label ?? t.label ?? t.value;
        const description = entry?.description ?? t.description ?? "";
        return { ...t, label, description };
    });
}
