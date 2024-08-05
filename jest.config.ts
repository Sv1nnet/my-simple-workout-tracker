const config = {
  preset: 'ts-jest',
  setupFilesAfterEnv: [ '<rootDir>/setupTests.ts' ],
  transform: {
    '.+\\.(css|styl|less|sass|scss)$': 'jest-css-modules-transform',
  },
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
}

export default config
