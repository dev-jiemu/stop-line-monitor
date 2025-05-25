import type { Config } from 'jest'

const config: Config = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.spec.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    coverageDirectory: './coverage',
    testEnvironment: 'node',
    roots: [
        "<rootDir>/src/",
        "<rootDir>/test/"
    ]
}

export default config