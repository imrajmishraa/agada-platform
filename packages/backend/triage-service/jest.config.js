module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@agada/shared$': '<rootDir>/packages/shared/src/index',
    '^@agada/shared/(.*)$': '<rootDir>/packages/shared/src/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/packages/backend/triage-service/',
    '/packages/backend/analytics-service/',
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
