graph TD
    subgraph "📱 Couche Présentation (Client)"
        direction LR
        Frontend[React Native / Expo]
        subgraph "Structure du code source (src/)"
            direction TB
            Screens[screens/] --> Components[components/]
            Screens --> Navigation[navigation/]
            Screens --> APIClient[api/]
            APIClient -.-> Context[context/]
        end
    end

    subgraph "⚙️ Couche Logique & Accès Données (Serveur)"
        direction LR
        Backend[Node.js / Express]
        subgraph "Structure du backend (backend/)"
            direction TB
            Server[server.js] --> Routes[routes/]
            Routes --> Middleware[middleware/]
            Routes --> Controllers[controllers/]
            Controllers --> Models[models/]
            Controllers --> Config[config/]
        end
    end

    subgraph "🗃️ Couche Persistance (Base de Données)"
        Database[Base de données SQL<br/><i>(gérée par Docker)</i>]
    end

    %% --- Liaisons entre les couches ---
    Frontend -- "<b>Requêtes API REST</b><br/>(HTTPS)" --> Backend
    Backend -- "<b>Requêtes SQL</b><br/>(Pilote de base de données)" --> Database

    %% --- Style des blocs ---
    style Frontend fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    style Backend fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style Database fill:#fbe9e7,stroke:#c62828,stroke-width:2px