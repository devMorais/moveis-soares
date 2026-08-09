import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:4200',
        specPattern: 'cypress/e2e/**/*.cy.ts',
        supportFile: 'cypress/support/e2e.ts',
        viewportWidth: 1440,
        viewportHeight: 900,
        defaultCommandTimeout: 8000,
        video: false,
        env: {
            apiUrl: 'https://backend-moveis-soares.test/api',
            adminEmail: 'admin@moveis-soares.test',
            adminPassword: 'Admin@123!',
            atendenteEmail: 'atendente@moveis-soares.test',
            atendentePassword: 'Atendente@123!',
        },
    },
});
