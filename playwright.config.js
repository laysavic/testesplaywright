// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 60000,
    fullyParallel: false,
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: 1,
    reporter: 'html',

    use: {
        headless: true,
        trace: 'on-first-retry',
    },

    projects: [
        { name: 'areas-happy',      testMatch: '**/areas/happy.spec.js',      use: { ...devices['Desktop Chrome'] } },
        { name: 'areas-sad',        testMatch: '**/areas/sad.spec.js',        use: { ...devices['Desktop Chrome'] } },
        { name: 'areas-edge',       testMatch: '**/areas/edge.spec.js',       use: { ...devices['Desktop Chrome'] } },
        { name: 'disciplinas-happy',testMatch: '**/disciplinas/happy.spec.js',use: { ...devices['Desktop Chrome'] } },
        { name: 'disciplinas-sad',  testMatch: '**/disciplinas/sad.spec.js',  use: { ...devices['Desktop Chrome'] } },
        { name: 'disciplinas-edge', testMatch: '**/disciplinas/edge.spec.js', use: { ...devices['Desktop Chrome'] } },
        { name: 'conteudos-happy',  testMatch: '**/conteudos/happy.spec.js',  use: { ...devices['Desktop Chrome'] } },
        { name: 'conteudos-sad',    testMatch: '**/conteudos/sad.spec.js',    use: { ...devices['Desktop Chrome'] } },
        { name: 'conteudos-edge',   testMatch: '**/conteudos/edge.spec.js',   use: { ...devices['Desktop Chrome'] } },
        { name: 'cursos-happy',     testMatch: '**/cursos/happy.spec.js',     use: { ...devices['Desktop Chrome'] } },
        { name: 'cursos-sad',       testMatch: '**/cursos/sad.spec.js',       use: { ...devices['Desktop Chrome'] } },
        { name: 'cursos-edge',      testMatch: '**/cursos/edge.spec.js',      use: { ...devices['Desktop Chrome'] } },
        { name: 'turmas-happy',     testMatch: '**/turmas/happy.spec.js',     use: { ...devices['Desktop Chrome'] } },
        { name: 'turmas-sad',       testMatch: '**/turmas/sad.spec.js',       use: { ...devices['Desktop Chrome'] } },
        { name: 'turmas-edge',      testMatch: '**/turmas/edge.spec.js',      use: { ...devices['Desktop Chrome'] } },
    ],
});