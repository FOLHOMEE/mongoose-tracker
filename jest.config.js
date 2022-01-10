module.exports = {
  roots: ['test'],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testPathIgnorePatterns: ['node_modules/'],
  "parserOptions" : "" ,
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testMatch: ['**/*.test.(ts|tsx)'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,ts,tsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/test/**',
    '!**/__mocks__/**'
  ]
}