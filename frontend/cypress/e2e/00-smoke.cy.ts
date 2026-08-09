describe('Smoke test - config basica', () => {
    it('carrega a home publica', () => {
        cy.visit('/');
        cy.contains('Móveis Soares', { matchCase: false }).should('exist');
    });

    it('login admin via API funciona e acessa /admin', () => {
        cy.loginAdminEVisitar('/admin');
        cy.contains('Olá,', { matchCase: false }).should('exist');
    });
});
