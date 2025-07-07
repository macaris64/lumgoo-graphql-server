# Lumgoo GraphQL Server

A production-ready GraphQL server built with Node.js, TypeScript, and Apollo Server.

## 🚀 Features

- **GraphQL API**: Modern GraphQL server with Apollo Server 4
- **Type Safety**: Full TypeScript support with automatic type generation
- **Testing**: Comprehensive test suite with Jest (unit & integration tests)
- **Code Quality**: ESLint, Prettier, and strict TypeScript configuration
- **Docker Support**: Production-ready Docker container with multi-stage build
- **CI/CD**: GitHub Actions workflow with quality gates and security scanning
- **Health Check**: Built-in health monitoring endpoint

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **GraphQL**: Apollo Server 4
- **Testing**: Jest with GraphQL testing utilities
- **Code Quality**: ESLint, Prettier
- **Containerization**: Docker with Alpine Linux
- **CI/CD**: GitHub Actions

## 📦 Installation

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/lumgoo-graphql-server.git
cd lumgoo-graphql-server

# Install dependencies
npm install

# Generate GraphQL types
npm run codegen

# Start development server
npm run dev
```

### Docker Development

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run directly with Docker
docker build -t lumgoo-graphql-server .
docker run -p 4000:4000 lumgoo-graphql-server
```

## 🔧 Available Scripts

### Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting
- `npm run typecheck` - Run TypeScript type checking

### Testing

- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode

### GraphQL

- `npm run codegen` - Generate TypeScript types from GraphQL schema
- `npm run codegen:watch` - Watch for schema changes and regenerate types

## 🔍 GraphQL Schema

The server provides the following GraphQL operations:

### Health Check

```graphql
query {
  health {
    status
    uptime
    timestamp
  }
}
```

## 📊 Project Structure

```
lumgoo-graphql-server/
├── src/
│   ├── generated/          # Auto-generated GraphQL types
│   ├── resolvers/          # GraphQL resolvers
│   │   ├── health/         # Health check resolver
│   │   └── index.ts        # Combined resolvers
│   ├── schema/             # GraphQL schema definitions
│   │   ├── base.graphql    # Base schema
│   │   ├── health.graphql  # Health check schema
│   │   └── index.ts        # Schema loader
│   ├── types/              # TypeScript types
│   └── index.ts            # Server entry point
├── __tests__/              # Test files
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
├── .github/workflows/      # GitHub Actions CI/CD
└── memory-bank/            # AI assistance memory system
```

## 🧪 Testing

This project follows Test-Driven Development (TDD) principles:

### Test Structure

- **Unit Tests**: Test individual resolvers and functions
- **Integration Tests**: Test complete GraphQL operations
- **Coverage**: Maintains >80% test coverage

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 🐳 Docker

### Development

```bash
# Start with Docker Compose
docker-compose up --build
```

### Production

```bash
# Build production image
docker build -t lumgoo-graphql-server .

# Run production container
docker run -p 4000:4000 lumgoo-graphql-server
```

## 🔄 CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow:

### Quality Gates

- ✅ ESLint code quality checks
- ✅ Prettier formatting validation
- ✅ TypeScript type checking
- ✅ Build process verification

### Testing

- ✅ Unit tests on Node.js 18 & 20
- ✅ Integration tests
- ✅ Coverage reporting (Codecov)

### Security

- ✅ npm audit security scan
- ✅ Snyk vulnerability scanning

### Docker

- ✅ Docker image build and test
- ✅ Container health check validation

### Performance

- ✅ Basic load testing (PR only)

## 📈 Monitoring

### Health Check

The server provides a GraphQL health check endpoint:

```graphql
query {
  health {
    status # "UP" or "DOWN"
    uptime # Server uptime in seconds
    timestamp # ISO 8601 timestamp
  }
}
```

### Development Server

- **GraphQL Playground**: Available at `http://localhost:4000/graphql`
- **Health Check**: Query the health endpoint for server status

## 🛡️ Security

- **Dependencies**: Regular security scanning with npm audit and Snyk
- **TypeScript**: Strict type checking prevents runtime errors
- **Docker**: Multi-stage builds with minimal attack surface
- **CI/CD**: Security gates in deployment pipeline

## 📚 Documentation

- **GraphQL Schema**: Self-documenting via GraphQL introspection
- **TypeScript Types**: Auto-generated from GraphQL schema
- **API Documentation**: Available via GraphQL Playground
- **Memory Bank**: AI-assisted development documentation in `memory-bank/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Run tests: `npm test`
4. Commit changes: `git commit -m 'Add my feature'`
5. Push to branch: `git push origin feature/my-feature`
6. Submit a pull request

### Development Guidelines

- Follow TDD principles - write tests first
- Maintain >80% test coverage
- Use conventional commit messages
- Ensure all CI checks pass

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Apollo Server team for the excellent GraphQL server implementation
- TypeScript team for type safety
- Jest team for the testing framework
- Docker team for containerization platform
