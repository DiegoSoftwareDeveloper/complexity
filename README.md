<p align="center">
  <a href="" rel="noopener">
 <img height=500px src="./docs/hex-ddd.png" alt="Project logo"></a>
</p>

## Description

Core backend with DDD + Hexagonal

# Get Starting

## Define ORM

Choose whether to work with mongodb, you can comment or remove the references in the modules, it depends on the ORM you choose.

## Installation

```bash
npm install
```

## Running the app

```bash
# development mode
npm run start:dev


# production mode
npm run start:prod
```

## Test

```bash
# unit tests
npm run test

# end to end tests
npm run test:e2e

# integration tests
npm run test:int

# test coverage
npm run test:cov
```

# Development

## Generate a new module in the architecture

note: test with --dry-run after omit --dry-run change products for name module

```bash
nest generate module products --dry-run

nest generate service products/applications/services/products --dry-run --no-spec

nest generate provider products/infrastructure/mongoose/repositories/products.repository --dry-run --no-spec --flat

nest generate controller products/infrastructure/nestjs/controllers/products --dry-run --no-spec --flat
```

## Development rules

- Before developing any functionality, make a diagram where you check the flow, domain model and database model.
- In the service layer avoid importing external libraries (e.g. mongo or SQL queries).
- Each endpoint to be developed should have one or more restclient .http files with example data.

## Pending to do

Create Facade ConfigService get as property config
Refactor email service add handler err in return
Support database relacional

Constructor Module
Scalar Module
Command Module (seeders database)

## Test API with REST client

Install extension REST Client [docs](https://marketplace.visualstudio.com/items?itemName=humao.rest-client/)

Configure token jwt `.vscode/settings.json`

```json
  "rest-client": {
    "enableTelemetry": false,
    "environmentVariables": {
      "$shared": {
        "TOKEN": "",
        "URL": "http://localhost:3000/api"
      },
      "local": {
        "URL": "http://localhost:3000/api"
      },
      "production": {
        "URL": "http://localhost:3000/api"
      }
    }
  }
```

## Documentation Official

<https://docs.nestjs.com/>
