beforeAll(() => {
  if (!process.env.SUPERSTORE_API_KEY) {
    throw new Error('SUPERSTORE_API_KEY missing in environment (.env). Add it to run tests.');
  }
});

