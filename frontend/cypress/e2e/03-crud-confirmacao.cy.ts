describe('CRUD com modal de confirmação', () => {
    const nomeCategoria = `Categoria Cypress ${Date.now()}`;

    it('cria, edita e exclui uma categoria (com confirmação)', () => {
        cy.loginAdminEVisitar('/admin/categorias');

        // Criar
        cy.get('#nome').type(nomeCategoria);
        cy.get('button.btn-salvar').contains('Adicionar').click();
        cy.get('.toast-item--success').should('exist');
        cy.contains(nomeCategoria).should('exist');

        // Editar
        cy.contains('.ag-row', nomeCategoria).find('[data-acao="editar"]').click();
        cy.get('#nome').should('have.value', nomeCategoria);
        const nomeEditado = `${nomeCategoria} Editada`;
        cy.get('#nome').clear().type(nomeEditado);
        cy.get('button.btn-salvar').contains('Atualizar').click();
        cy.get('.toast-item--success').should('exist');
        cy.contains(nomeEditado).should('exist');

        // Excluir - clicar em remover deve abrir o modal, não excluir direto
        cy.contains('.ag-row', nomeEditado).find('[data-acao="remover"]').click();
        cy.get('.modal-detalhe').should('exist');
        cy.contains('Remover categoria').should('exist');

        // Cancelar não deve excluir
        cy.get('button.btn-cancelar').click();
        cy.get('.modal-detalhe').should('not.exist');
        cy.contains(nomeEditado).should('exist');

        // Confirmar exclusão
        cy.contains('.ag-row', nomeEditado).find('[data-acao="remover"]').click();
        cy.get('button.btn-excluir').click();
        cy.get('.toast-item--success').should('exist');
        cy.contains(nomeEditado).should('not.exist');
    });

    it('o formulário "Novo produto" abre com todos os campos exigidos', () => {
        cy.loginAdminEVisitar('/admin/produtos/novo');

        cy.get('#nome').should('exist');
        cy.get('#categoria_id').should('exist');
        cy.get('#preco').should('exist');
        cy.get('#estoque').should('exist');
        cy.get('button.btn-salvar').should('exist');
    });

    it('cancelar exclusão de produto na listagem preserva o produto (não afeta dados reais de catálogo)', () => {
        cy.loginAdminEVisitar('/admin/produtos');
        cy.get('.ag-row').should('have.length.at.least', 1);

        cy.get('.ag-row').first().find('[data-acao="remover"]').click();
        cy.get('.modal-detalhe').should('exist');
        cy.contains('Remover produto').should('exist');

        cy.get('button.btn-cancelar').click();
        cy.get('.modal-detalhe').should('not.exist');
    });

    it('atendente não vê botão de remover em produtos/categorias, mas vê editar', () => {
        cy.loginAtendenteEVisitar('/admin/produtos');
        cy.get('.ag-row').should('have.length.at.least', 1);
        cy.get('.ag-row').first().find('[data-acao="editar"]').should('exist');
        cy.get('[data-acao="remover"]').should('not.exist');

        cy.visit('/admin/categorias');
        cy.get('.ag-row').first().find('[data-acao="editar"]').should('exist');
        cy.get('[data-acao="remover"]').should('not.exist');
    });

    it('atendente consegue editar um produto existente (criar/editar liberado)', () => {
        cy.loginAtendenteEVisitar('/admin/produtos');

        cy.get('.ag-row').first().find('[data-acao="editar"]').click();
        cy.url().should('include', '/editar');
        cy.get('#nome').should('exist').and('not.be.disabled');
        cy.get('button.btn-salvar').should('exist');
    });
});
