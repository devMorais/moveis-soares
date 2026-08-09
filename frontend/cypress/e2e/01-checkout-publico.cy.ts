// Produto fixo com estoque alto (18 un.) reservado para os testes E2E de
// checkout - evita depender do "primeiro card" da grade, cujo estoque pode
// variar conforme outros testes/pedidos reais criados no catálogo.
const SLUG_PRODUTO_TESTE = 'cadeira-de-cozinha-madeira-clara';

describe('Checkout público', () => {
    beforeEach(() => {
        cy.visit(`/produto/${SLUG_PRODUTO_TESTE}`);
        cy.get('h1').should('exist');
    });

    it('adiciona produto ao carrinho, abre carrinho lateral e vai pro checkout', () => {
        cy.get('button.btn-comprar').should('exist').click();

        // Toast de sucesso ao adicionar
        cy.get('.toast-item--success').should('exist');

        // Carrinho lateral abre automaticamente (carrinhoService.abrir() no
        // fluxo de adicionarAoCarrinho, ver produto.ts)
        cy.get('aside.carrinho-painel').should('have.class', 'aberto');
        cy.get('.carrinho-item').should('have.length.at.least', 1);

        cy.get('button.btn-finalizar').click();
        cy.url().should('include', '/checkout');
    });

    it('preenche o formulário de checkout com observações e cidade cadastrada', () => {
        cy.get('button.btn-comprar').click();
        cy.get('button.btn-finalizar').click();

        cy.url().should('include', '/checkout');

        cy.get('#nome').type('Cliente Teste Cypress');
        cy.get('#telefone').type('61999998888');
        cy.get('#endereco').type('Rua dos Testes, 123');
        cy.get('#cidadeTexto').type('Brasília');
        cy.get('.cidades-sugestoes button').contains('Brasília').click();

        cy.get('#observacoes').type('Entregar somente após as 18h. Teste automatizado Cypress.');

        // Frete calculado (cidade cadastrada = sem "a combinar")
        cy.get('.checkout-resumo__linha').should('contain.text', 'Frete');

        cy.get('button.btn-finalizar').should('not.be.disabled');
    });

    it('mostra aviso de frete a combinar para cidade não cadastrada', () => {
        cy.get('button.btn-comprar').click();
        cy.get('button.btn-finalizar').click();

        cy.get('#cidadeTexto').type('Uma Cidade Que Nao Existe XYZ');
        cy.get('#cidadeTexto').blur();

        cy.get('.aviso-frete-combinar').should('exist');
        cy.get('.aviso-frete-combinar').contains('combinar', { matchCase: false });
    });
});
