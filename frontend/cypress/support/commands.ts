/// <reference types="cypress" />

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            /** Loga via API e visita `path` ja autenticado (sem passar pelo form). */
            loginEVisitar(email: string, password: string, path: string): Chainable<void>;
            loginAdminEVisitar(path: string): Chainable<void>;
            loginAtendenteEVisitar(path: string): Chainable<void>;
        }
    }
}

// A rota de login tem throttle:5,1 no backend (5 tentativas/minuto). cy.session
// cacheia a sessao por email com cacheAcrossSpecs, entao o POST /admin/login so
// acontece de verdade uma vez por conta na suite inteira, nao a cada teste/spec.
Cypress.Commands.add('loginEVisitar', (email: string, password: string, path: string) => {
    cy.session(
        email,
        () => {
            cy.request('POST', `${Cypress.env('apiUrl')}/admin/login`, { email, password }).then((resp) => {
                cy.visit('/', {
                    onBeforeLoad(win) {
                        win.localStorage.setItem('token', resp.body.token);
                        win.localStorage.setItem('user', JSON.stringify(resp.body.user));
                    },
                });
            });
        },
        { cacheAcrossSpecs: true },
    );

    cy.visit(path);
});

Cypress.Commands.add('loginAdminEVisitar', (path: string) => {
    cy.loginEVisitar(Cypress.env('adminEmail'), Cypress.env('adminPassword'), path);
});

Cypress.Commands.add('loginAtendenteEVisitar', (path: string) => {
    cy.loginEVisitar(Cypress.env('atendenteEmail'), Cypress.env('atendentePassword'), path);
});

export {};
