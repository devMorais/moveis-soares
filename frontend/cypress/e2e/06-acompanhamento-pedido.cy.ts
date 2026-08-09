describe('Página pública de acompanhamento de pedido', () => {
    function criarPedidoDeTeste() {
        return cy
            .request({
                method: 'GET',
                url: `${Cypress.env('apiUrl')}/produtos`,
            })
            .then((resp) => {
                const produto = resp.body[0];

                return cy
                    .request({
                        method: 'POST',
                        url: `${Cypress.env('apiUrl')}/pedidos`,
                        failOnStatusCode: false,
                        body: {
                            nome_cliente: 'Cliente Cypress Acompanhamento',
                            telefone_cliente: '61988887777',
                            endereco: 'Rua do Teste E2E, 42',
                            observacoes: 'Pedido criado pelo teste E2E de acompanhamento.',
                            cidade_texto_livre: 'Brasília',
                            frete_a_combinar: true,
                            itens: [{ produto_id: produto.id, quantidade: 1 }],
                        },
                    })
                    .then(() => produto);
            });
    }

    function pegarTokenDoUltimoPedido() {
        cy.loginAdminEVisitar('/admin/pedidos');

        return cy.window().then((win) => {
            const token = win.localStorage.getItem('token');
            return cy
                .request({
                    method: 'GET',
                    url: `${Cypress.env('apiUrl')}/admin/pedidos`,
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((resp) => {
                    const pedido = resp.body.find(
                        (p: { nomeCliente: string }) => p.nomeCliente === 'Cliente Cypress Acompanhamento',
                    );
                    return pedido?.tokenAcompanhamento as string;
                });
        });
    }

    it('cria pedido via API e acompanha pelo token público (timeline, itens, observações)', () => {
        criarPedidoDeTeste();

        pegarTokenDoUltimoPedido().then((token) => {
            expect(token, 'token de acompanhamento gerado').to.be.a('string');

            cy.visit(`/pedido/acompanhar/${token}`);

            cy.contains('Pedido #').should('exist');
            cy.contains('Cliente Cypress Acompanhamento', { matchCase: false }).should('exist');
            cy.get('.timeline__etapa').should('have.length', 5);
            cy.get('.timeline__etapa--concluida').should('have.length.at.least', 1);
            cy.contains('Observações').should('exist');
            cy.contains('Pedido criado pelo teste E2E').should('exist');
            cy.get('a.btn-whatsapp').should('have.attr', 'href').and('include', 'https://wa.me/');
        });
    });

    it('token inválido mostra estado de erro', () => {
        cy.visit('/pedido/acompanhar/token-que-nao-existe-123');
        cy.contains('Não encontramos esse pedido', { matchCase: false }).should('exist');
        cy.get('a.btn-whatsapp').should('exist');
    });
});
