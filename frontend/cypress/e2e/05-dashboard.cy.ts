describe('Dashboard admin', () => {
    it('carrega KPIs, gráficos e rankings numa única passada (sem depender de interação extra)', () => {
        cy.loginAdminEVisitar('/admin');

        // Regressao do bug: os rankings ficavam em branco ate outro evento
        // (ex: clique no dropdown) forcar um novo ciclo de change detection.
        // O fix foi ChangeDetectorRef.detectChanges() apos popular os dados.
        cy.contains('Faturamento total').should('exist');
        cy.contains('Pedidos no mês').should('exist');
        cy.contains('Ticket médio').should('exist');
        cy.contains('Aguardando pagamento').should('exist');

        cy.get('canvas').should('have.length', 2);

        cy.contains('.ranking-card', 'Produtos mais vendidos').within(() => {
            cy.get('.ranking-lista li, .ranking-card__vazio').should('exist');
        });
        cy.contains('.ranking-card', 'Produtos mais visitados').within(() => {
            cy.get('.ranking-lista li, .ranking-card__vazio').should('exist');
        });
        cy.contains('.ranking-card', 'Categorias mais visitadas').within(() => {
            cy.get('.ranking-lista li, .ranking-card__vazio').should('exist');
        });
    });

    it('ações rápidas navegam para as telas corretas', () => {
        cy.loginAdminEVisitar('/admin');

        cy.contains('.acao-rapida', 'Novo produto').click();
        cy.url().should('include', '/admin/produtos/novo');

        cy.visit('/admin');
        cy.contains('.acao-rapida', 'pedidos').click();
        cy.url().should('include', '/admin/pedidos');
    });

    it('atendente vê só a contagem de pedidos aguardando, sem gráficos', () => {
        cy.loginAtendenteEVisitar('/admin');

        cy.contains('Pedidos aguardando pagamento').should('exist');
        cy.get('canvas').should('not.exist');
        cy.contains('.ranking-card', 'Produtos mais vendidos').should('not.exist');
    });
});
