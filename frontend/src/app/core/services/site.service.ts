import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SITE_INFO } from '../constants/site-info';
import { ItemLista, SiteConteudo } from '../types/site/site-conteudo.type';

/**
 * Formato cru devolvido pelo backend (snake_case), ver
 * SiteController::conteudo().
 */
interface SiteConteudoBruto {
    hero: { titulo: string | null; subtitulo: string | null } | null;
    sobre: {
        titulo_historia: string | null;
        texto_historia: string | null;
        imagem_url: string | null;
        diferenciais: ItemLista[] | null;
    } | null;
    contato: {
        telefone_display: string | null;
        telefone_whatsapp: string | null;
        email: string | null;
        endereco: string | null;
        horario: string | null;
    } | null;
    institucional: {
        itens: ItemLista[] | null;
        resumo_titulo: string | null;
        resumo_texto: string | null;
    } | null;
    cta: Record<string, { titulo: string | null; texto: string | null }>;
    secoesVisiveis: Record<string, boolean>;
}

/** Conteudo de fallback: o mesmo texto que estava hardcoded antes da migracao pra conteudo dinamico. */
const FALLBACK: SiteConteudo = {
    hero: null,
    sobre: {
        tituloHistoria: 'Nossa história',
        textoHistoria:
            'A Móveis Soares nasceu do compromisso de oferecer móveis de qualidade com preço que cabe no bolso das famílias. Do escritório ao quarto, da sala à cozinha, cada peça é escolhida pensando em durabilidade e acabamento.',
        imagemUrl: null,
        diferenciais: [
            { titulo: 'Qualidade que você vê', texto: 'Acabamento cuidadoso e materiais resistentes em cada peça do catálogo.' },
            { titulo: 'Preço justo', texto: 'Móveis bonitos e duráveis sem pesar no orçamento da sua casa.' },
            { titulo: 'Entrega combinada com você', texto: 'Alinhamos prazo e forma de entrega direto com o cliente, sem surpresas.' },
            { titulo: 'Atendimento próximo', texto: 'Tiramos suas dúvidas pelo WhatsApp antes, durante e depois da compra.' },
        ],
    },
    contato: {
        telefoneDisplay: SITE_INFO.phoneDisplay,
        telefoneWhatsapp: SITE_INFO.phoneWhatsapp,
        email: SITE_INFO.email,
        endereco: SITE_INFO.address,
        horario: SITE_INFO.hours,
    },
    institucional: {
        itens: [
            { titulo: 'Entrega combinada com você', texto: 'Alinhamos prazo e forma de entrega direto com o cliente, sem surpresas.' },
            { titulo: 'Qualidade que você vê', texto: 'Acabamento cuidadoso e materiais resistentes em cada peça do catálogo.' },
            { titulo: 'Atendimento próximo', texto: 'Tiramos suas dúvidas pelo WhatsApp antes, durante e depois da compra.' },
        ],
        resumoTitulo: 'Quem somos',
        resumoTexto:
            'A Móveis Soares monta cada ambiente da sua casa com móveis de qualidade e acabamento pensado pra durar — do escritório à sala, do quarto à cozinha.',
    },
    cta: {
        home: { titulo: 'Pronto pra renovar sua casa?', texto: 'Fale agora com a nossa equipe e tire suas dúvidas sobre entrega e formas de pagamento.' },
        sobre: { titulo: 'Vamos renovar sua casa?', texto: 'Entre em contato e converse com a nossa equipe sobre o móvel ideal pra você.' },
    },
    secoesVisiveis: { hero: true, sobre: true, contato: true },
};

@Injectable({ providedIn: 'root' })
export class SiteService {
    private http = inject(HttpClient);

    /** Populado com o fallback imediatamente; atualiza quando a resposta real chega. */
    conteudo = signal<SiteConteudo>(FALLBACK);

    private carregamento$: Observable<SiteConteudo> | null = null;

    carregar(): void {
        this.aguardarCarregamento().subscribe();
    }

    /**
     * Usado por guards de rota que precisam saber o conteudo real (ex: secoesVisiveis)
     * antes de decidir se a navegacao pode continuar - o signal `conteudo` comeca com o
     * fallback (tudo visivel), entao ler ele direto na hora da navegacao poderia liberar
     * uma secao desligada por uma fracao de segundo, antes da resposta da API chegar.
     */
    aguardarCarregamento(): Observable<SiteConteudo> {
        if (!this.carregamento$) {
            this.carregamento$ = this.http.get<SiteConteudoBruto>(`${environment.apiUrl}/site`).pipe(
                map((bruto) => this.normalizar(bruto)),
                tap((conteudo) => this.conteudo.set(conteudo)),
                catchError(() => of(this.conteudo())),
                shareReplay(1),
            );
        }
        return this.carregamento$;
    }

    private normalizar(bruto: SiteConteudoBruto): SiteConteudo {
        return {
            hero: bruto.hero
                ? { titulo: bruto.hero.titulo, subtitulo: bruto.hero.subtitulo }
                : FALLBACK.hero,
            sobre: bruto.sobre
                ? {
                      tituloHistoria: bruto.sobre.titulo_historia ?? FALLBACK.sobre?.tituloHistoria ?? null,
                      textoHistoria: bruto.sobre.texto_historia ?? FALLBACK.sobre?.textoHistoria ?? null,
                      imagemUrl: bruto.sobre.imagem_url,
                      diferenciais: bruto.sobre.diferenciais?.length ? bruto.sobre.diferenciais : FALLBACK.sobre?.diferenciais ?? null,
                  }
                : FALLBACK.sobre,
            contato: bruto.contato
                ? {
                      telefoneDisplay: bruto.contato.telefone_display ?? FALLBACK.contato?.telefoneDisplay ?? null,
                      telefoneWhatsapp: bruto.contato.telefone_whatsapp ?? FALLBACK.contato?.telefoneWhatsapp ?? null,
                      email: bruto.contato.email ?? FALLBACK.contato?.email ?? null,
                      endereco: bruto.contato.endereco ?? FALLBACK.contato?.endereco ?? null,
                      horario: bruto.contato.horario ?? FALLBACK.contato?.horario ?? null,
                  }
                : FALLBACK.contato,
            institucional: bruto.institucional
                ? {
                      itens: bruto.institucional.itens?.length ? bruto.institucional.itens : FALLBACK.institucional?.itens ?? null,
                      resumoTitulo: bruto.institucional.resumo_titulo ?? FALLBACK.institucional?.resumoTitulo ?? null,
                      resumoTexto: bruto.institucional.resumo_texto ?? FALLBACK.institucional?.resumoTexto ?? null,
                  }
                : FALLBACK.institucional,
            cta: {
                home: bruto.cta?.['home'] ?? FALLBACK.cta['home'],
                sobre: bruto.cta?.['sobre'] ?? FALLBACK.cta['sobre'],
            },
            secoesVisiveis: { ...FALLBACK.secoesVisiveis, ...(bruto.secoesVisiveis ?? {}) },
        };
    }
}
