import './commands';

// Backend/frontend rodam com self-signed cert local (Herd) - erros de
// certificado ou excecoes nao tratadas do proprio app nao devem derrubar
// os testes (ex: warnings de terceiros como Chart.js/AG Grid).
Cypress.on('uncaught:exception', () => false);
