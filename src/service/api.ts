import { IApiResponseCalls, ICalls } from "@/models/ICalls";

export async function BuscaEFiltraLigacoes(startDate: string, endDate: string): Promise<ICalls[]> {
    const baseUrl = "https://api.omnismart.app/v1/report/calls";
    const token = "eyJhbGciOiJIUzI1NiJ9.YzVkNGM1NGZmYjI2NDFkNGQwZDE3ZTQ1OTY4MDlmMzA.wXFbkudAjzcUEs62Dv6x37eYqdI3Vxs9fW0vTf79OTo";
    const limit = "50";
    const teams = "6a58e1ccd940fd34176cac43";
    
    const TAMANHO_LOTE = 10; 

    const fetchPage = async (page: number): Promise<IApiResponseCalls> => {
        const params = new URLSearchParams({
            startDate,
            endDate,
            limit,
            teams,
            page: page.toString()
        });

        const inicio = Date.now();
        const response = await fetch(`${baseUrl}?${params.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        console.log(`Página ${page} demorou ${Date.now() - inicio}ms para responder.`);

        if (!response.ok) {
            throw new Error(`Erro na página ${page}: Status ${response.status}`);
        }

        return response.json();
    };

    try {
        console.log(`[Omnismart API] Buscando primeira página...`);
        
        const primeiraPaginaData = await fetchPage(1);
        
        let todasAsLigacoes: ICalls[] = [...primeiraPaginaData.data];
        const totalPages = primeiraPaginaData.meta.pageCount; 

        if (totalPages && totalPages > 1) {
            console.log(`[Omnismart API] Total de páginas: ${totalPages}. Processando em lotes de ${TAMANHO_LOTE}...`);
            
            const paginasRestantes: number[] = [];
            for (let i = 2; i <= totalPages; i++) {
                paginasRestantes.push(i);
            }

            for (let i = 0; i < paginasRestantes.length; i += TAMANHO_LOTE) {
                const loteAtual = paginasRestantes.slice(i, i + TAMANHO_LOTE);
                console.log(`[Omnismart API] Executando lote de páginas: ${loteAtual.join(", ")}`);

                const promessasLote = loteAtual.map(page => fetchPage(page));
                
                const resultadosLote = await Promise.all(promessasLote);
                
                for (const pagina of resultadosLote) {
                    todasAsLigacoes.push(...pagina.data);
                }

            }
        }

        console.log(`[Sucesso] Total de ligações do suporte filtradas: ${todasAsLigacoes.length}`);
        return todasAsLigacoes;

    } catch (error) {
        console.error("Falha ao buscar dados na Omnismart:", error);
        throw error;
    }
}
