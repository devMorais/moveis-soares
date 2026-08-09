describe('Pedidos - detalhe, status, atendente, WhatsApp e link', () => {
    beforeEach(() => {
        cy.loginAdminEVisitar('/admin/pedidos');
        cy.get('.ag-row').should('have.length.at.least', 1);
    });

    it('abre o modal de detalhe com fotos, itens e observações', () => {
        cy.get('.ag-row').first().find('[data-acao="detalhe"]').click();

        cy.get('.modal-detalhe').should('exist');
        cy.get('.modal-detalhe__topo h2').should('contain.text', 'Pedido #');
        cy.get('.modal-detalhe__itens--com-foto li').should('have.length.at.least', 1);
        cy.get('.modal-detalhe__total').should('contain.text', 'Total');
    });

    it('fecha o modal ao clicar no X ou fora dele', () => {
        cy.get('.ag-row').first().find('[data-acao="detalhe"]').click();
        cy.get('.modal-detalhe').should('exist');

        cy.get('button.modal-detalhe__fechar').click();
        cy.get('.modal-detalhe').should('not.exist');

        cy.get('.ag-row').first().find('[data-acao="detalhe"]').click();
        cy.get('.modal-fundo').click('topLeft');
        cy.get('.modal-detalhe').should('not.exist');
    });

    it('botão de WhatsApp aponta pro telefone do cliente com mensagem contendo o link de acompanhamento', () => {
        cy.get('.ag-row').first().find('[data-acao="detalhe"]').click();

        cy.get('a.btn-whatsapp')
            .should('have.attr', 'href')
            .and('include', 'https://wa.me/')
            .and('include', 'pedido%2Facompanhar%2F');
    });

    it('botão copiar link de acompanhamento existe e é clicável', () => {
        cy.get('.ag-row').first().find('[data-acao="detalhe"]').click();
        cy.get('button.btn-copiar-link').should('exist').click();
    });

    it('assume atendimento de um pedido sem atendente e mostra o nome depois', () => {
        // Cria via API um pedido novo (sempre nasce sem atendente_id), em vez
        // de vasculhar a tabela procurando um - evita depender de estado
        // pre-existente e do padrao fragil each()/find() com DOM mutavel.
        const nomeCliente = `Cliente Assumir Atendimento ${Date.now()}`;

        cy.request(`${Cypress.env('apiUrl')}/produtos`).then((resp) => {
            const produto = resp.body.find((p: { estoque: number | null }) => (p.estoque ?? 1) > 0);

            cy.request({
                method: 'POST',
                url: `${Cypress.env('apiUrl')}/pedidos`,
                failOnStatusCode: false,
                body: {
                    nome_cliente: nomeCliente,
                    telefone_cliente: '61977776666',
                    endereco: 'Rua do Teste de Atendimento, 1',
                    observacoes: null,
                    cidade_texto_livre: 'Brasília',
                    frete_a_combinar: true,
                    itens: [{ produto_id: produto.id, quantidade: 1 }],
                },
            });
        });

        cy.reload();
        cy.get('.ag-row').should('have.length.at.least', 1);
        cy.contains('.ag-row', nomeCliente).find('[data-acao="detalhe"]').click();

        cy.get('button.btn-assumir').should('exist').click();
        cy.get('.toast-item--success').should('exist');
        cy.get('.modal-detalhe__atendente').should('contain.text', 'Atendido por');
    });

    it('altera o status do pedido pelo select', () => {
        cy.get('.ag-row').first().find('[data-acao="detalhe"]').click();

        cy.get('.campo-status select').then(($select) => {
            const atual = $select.val();
            const novo = atual === 'AGUARDANDO' ? 'PAGO' : 'AGUARDANDO';
            cy.wrap($select).select(novo);
        });

        cy.get('.toast-item--success').should('exist');
    });

    it('filtra pedidos por status', () => {
        cy.contains('.filtros button', 'Aguardando pagamento').click();
        cy.get('.filtros button.ativo').should('contain.text', 'Aguardando');
    });

    it('atendente também consegue ver e operar pedidos normalmente', () => {
        cy.loginAtendenteEVisitar('/admin/pedidos');
        cy.get('.ag-row').should('have.length.at.least', 1);
        cy.get('.ag-row').first().find('[data-acao="detalhe"]').click();
        cy.get('.modal-detalhe').should('exist');
        cy.get('a.btn-whatsapp').should('exist');
    });
});
