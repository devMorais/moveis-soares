export interface ItemLista {
    titulo: string;
    texto: string;
}

export interface SecaoSobre {
    tituloHistoria: string | null;
    textoHistoria: string | null;
    imagemUrl: string | null;
    diferenciais: ItemLista[] | null;
}

export interface SecaoContato {
    telefoneDisplay: string | null;
    telefoneWhatsapp: string | null;
    email: string | null;
    endereco: string | null;
    horario: string | null;
}

export interface SecaoInstitucional {
    itens: ItemLista[] | null;
    resumoTitulo: string | null;
    resumoTexto: string | null;
}

export interface SecaoCtaItem {
    titulo: string | null;
    texto: string | null;
}

export interface SiteConteudo {
    /** Nunca null na prática - o service sempre garante o fallback estático. */
    sobre: SecaoSobre;
    contato: SecaoContato;
    institucional: SecaoInstitucional;
    cta: Record<string, SecaoCtaItem>;
    secoesVisiveis: Record<string, boolean>;
}
