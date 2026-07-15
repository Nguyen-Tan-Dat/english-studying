# API contracts

`openapi.yaml` is the source of truth. Do not hand-maintain duplicate request/response interfaces.

```bash
npm run generate:api
npm run test:contract
```

The generated declarations are consumed by both frontend and backend.
