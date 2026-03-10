# Claude Marketplace

A marketplace service for Claude Code extensions (Skills and Plugins).

## Structure

```
claude-marketplace/
├── packages/
│   ├── service/        # Marketplace API service
│   ├── cli/            # CLI tools
│   └── shared/         # Shared types and utilities
├── skills/             # Marketplace CLI skills
│   ├── mp-search/
│   ├── mp-install/
│   └── ...
└── docs/               # Documentation
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build all packages
pnpm build
```

## License

MIT
