# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Padrões do projeto

### Componente de módulo bloqueado (upgrade de plano)

`shared/components/modulo-bloqueado` é um componente **genérico**, reaproveitável em qualquer projeto clonado do padrão Dolen/CRC — não tem nenhum texto específico deste cliente embutido. Ele envolve o conteúdo real de um módulo e só o exibe se esse módulo estiver habilitado (consultado uma vez via `GET /api/modulos` e cacheado em `ModulosService`); caso contrário, mostra um overlay de "recurso bloqueado" com CTA fixo para o WhatsApp da Dolen (não o do cliente).

Uso:

```html
<app-modulo-bloqueado nomeModulo="instagram" mensagem="Publique direto do painel fazendo upgrade do seu plano.">
    <div>conteúdo real do módulo aqui — só aparece se "instagram" estiver true em modulos_habilitados</div>
</app-modulo-bloqueado>
```

Para habilitar um módulo pra um cliente, editar a coluna `modulos_habilitados` (JSON) na tabela `configuracoes_site` do backend.
