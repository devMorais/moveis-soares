describe('Login e permissões por papel', () => {
    it('login com credenciais inválidas mostra erro', () => {
        cy.visit('/admin/login');
        cy.get('#email').type('naoexiste@moveis-soares.test');
        cy.get('#password').type('SenhaErrada123');
        cy.get('button.btn-entrar').click();

        cy.get('.toast-item--error').should('exist');
        cy.url().should('include', '/admin/login');
    });

    it('login admin via formulário funciona e chega no dashboard completo', () => {
        cy.visit('/admin/login');
        cy.get('#email').type(Cypress.env('adminEmail'));
        cy.get('#password').type(Cypress.env('adminPassword'));
        cy.get('button.btn-entrar').click();

        cy.url().should('match', /\/admin\/?$/);
        cy.contains('Olá,', { matchCase: false }).should('exist');
        cy.contains('Faturamento total').should('exist');
    });

    it('admin vê todos os itens do menu', () => {
        cy.loginAdminEVisitar('/admin');

        cy.get('.admin-sidebar__menu').within(() => {
            cy.contains('Início').should('exist');
            cy.contains('Conteúdo').should('exist');
            cy.contains('Categorias').should('exist');
            cy.contains('Produtos').should('exist');
            cy.contains('Entrega').should('exist');
            cy.contains('Pedidos').should('exist');
            cy.contains('Instagram').should('exist');
            cy.contains('Configurações').should('exist');
        });
    });

    it('atendente NÃO vê itens restritos no menu, só Categorias/Produtos/Pedidos', () => {
        cy.loginAtendenteEVisitar('/admin');

        cy.get('.admin-sidebar__menu').within(() => {
            cy.contains('Categorias').should('exist');
            cy.contains('Produtos').should('exist');
            cy.contains('Pedidos').should('exist');

            cy.contains('Conteúdo').should('not.exist');
            cy.contains('Entrega').should('not.exist');
            cy.contains('Instagram').should('not.exist');
            cy.contains('Configurações').should('not.exist');
        });
    });

    it('atendente vê dashboard simplificado (sem faturamento/gráficos)', () => {
        cy.loginAtendenteEVisitar('/admin');

        cy.contains('Pedidos aguardando pagamento').should('exist');
        cy.contains('Faturamento total').should('not.exist');
        cy.get('canvas').should('not.exist');
    });

    it('atendente é bloqueado ao tentar acessar Configurações via URL direta', () => {
        cy.loginAtendenteEVisitar('/admin/configuracoes');
        // adminOnlyGuard redireciona para /admin
        cy.url().should('match', /\/admin\/?$/);
        cy.url().should('not.include', 'configuracoes');
    });

    it('atendente é bloqueado ao tentar acessar Entrega via URL direta', () => {
        cy.loginAtendenteEVisitar('/admin/entrega');
        cy.url().should('match', /\/admin\/?$/);
    });

    it('atendente é bloqueado ao tentar acessar Conteúdo via URL direta', () => {
        cy.loginAtendenteEVisitar('/admin/conteudo/inicio');
        cy.url().should('match', /\/admin\/?$/);
    });

    it('logout limpa sessão e redireciona pro login', () => {
        // Login via formulario (nao via cy.session) - o logout revoga o token
        // no backend, entao esse teste NAO pode reusar a sessao cacheada com
        // cy.session que os outros testes desta suite compartilham, ou os
        // testes seguintes (neste spec ou em specs futuros, ja que a sessao
        // tem cacheAcrossSpecs) herdariam um token morto.
        cy.visit('/admin/login');
        cy.get('#email').type(Cypress.env('adminEmail'));
        cy.get('#password').type(Cypress.env('adminPassword'));
        cy.get('button.btn-entrar').click();
        cy.url().should('match', /\/admin\/?$/);

        cy.get('button.admin-sidebar__sair').click();
        cy.url().should('include', '/admin/login');

        cy.visit('/admin');
        cy.url().should('include', '/admin/login');
    });
});
