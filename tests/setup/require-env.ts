const apiKey = process.env.SUPERSTORE_API_KEY;

if (!apiKey) {
  throw new Error(
    'SUPERSTORE_API_KEY must be set before running tests. Live API calls are required and no fake datasource is available.'
  );
}
