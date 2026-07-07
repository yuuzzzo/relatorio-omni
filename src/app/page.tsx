"use client";

import { useState, useMemo } from "react";
import styles from "./page.module.css";
import { BuscaEFiltraLigacoes } from "@/service/api";
import { ICalls } from "@/models/ICalls";
import DateTimeInput from "@/components/DateTimeInput";

import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

import { Phone, Users, FileText, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const [valueStartDate, setValueStartDate] = useState<string>('');
  const [valueEndDate, setValueEndDate] = useState<string>('');
  const [apiDados, setApiDados] = useState<ICalls[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);
  
  const [paginaAtualTabela, setPaginaAtualTabela] = useState<number>(1);
  const REGISTROS_POR_PAGINA = 15;

  const sendDate = async (startDateBr: string, endDateBr: string) => {
    if (!startDateBr || !endDateBr) {
      alert("Por favor, preencha ambas as datas!");
      return;
    }

    if (startDateBr.length < 16 || endDateBr.length < 16) {
      alert("Por favor, digite a data e hora completa (DD/MM/AAAA HH:MM)!");
      return;
    }

    const converterParaISO = (dataBr: string): string => {
      const [data, hora] = dataBr.split(" ");
      const [dia, mes, ano] = data.split("/");
      const [horas, minutos] = hora.split(":");
      return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}:00.000Z`;
    };

    try {
      setCarregando(true);
      setPaginaAtualTabela(1);
      
      const startDateIso = converterParaISO(startDateBr);
      const endDateIso = converterParaISO(endDateBr);

      const dados = await BuscaEFiltraLigacoes(startDateIso, endDateIso);
      setApiDados(dados);
      console.log("Dados recebidos e aplicados na tela!");
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setCarregando(false);
    }
  };

  const CORES = {
    CALL_CONFIRMED: "#48bb78",
    CALL_ABANDONED: "#f56565",
    CALL_FAILED: "#ed8936",
    BUSY: "#ecc94b",
    CALL_NOT_ATTENDED: "#4299e1",
    OUTROS: "#a0aec0"
  };

  const dadosPizza = useMemo(() => {
    const contagem: Record<string, number> = {
      CALL_CONFIRMED: 0,
      CALL_ABANDONED: 0,
      CALL_FAILED: 0,
      BUSY: 0,
      CALL_NOT_ATTENDED: 0,
      OUTROS: 0
    };

    apiDados.forEach(call => {
      const status = call.status;

      if(call.status === "CALL_CONFIRMED" && call.type === "outbound"){
      }else if (status in contagem) {
        contagem[status]++;
      }else {
        contagem.OUTRO++;
      }
    });

    return Object.keys(contagem)
      .map(chave => ({ name: chave, value: contagem[chave] }))
      .filter(item => item.value > 0);
  }, [apiDados]);

  const dadosAgente = useMemo(() => {
    const agentes: Record<string, any> = {};

    apiDados.forEach(call => {
      const nome = call.userName || "Sem Agente";
      const status = call.status;

      if (!agentes[nome]) {
        agentes[nome] = {
          name: nome,
          CALL_CONFIRMED: 0,
          CALL_ABANDONED: 0,
          CALL_FAILED: 0,
          BUSY: 0,
          CALL_NOT_ATTENDED: 0
        };
      }

      if (call.status === "CALL_CONFIRMED" && call.type === "outbound"){
      }else if(status in agentes[nome]){
        agentes[nome][status]++;
      }
    });

    return Object.values(agentes);
  }, [apiDados]);

  const totalPaginasTabela = Math.ceil(apiDados.length / REGISTROS_POR_PAGINA);

  const ligacoesPaginadas = useMemo(() => {
    const indiceInicial = (paginaAtualTabela - 1) * REGISTROS_POR_PAGINA;
    const indiceFinal = indiceInicial + REGISTROS_POR_PAGINA;
    return apiDados.slice(indiceInicial, indiceFinal);
  }, [apiDados, paginaAtualTabela]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      CALL_CONFIRMED: "Atendida",
      CALL_ABANDONED: "Abandonada",
      CALL_FAILED: "Falha",
      BUSY: "Ocupado",
      CALL_NOT_ATTENDED: "Não Atendida",
      CALL_CANCELED: "Cancelada"
    };
    return labels[status] || status;
  };

  const getStatusStyle = (status: string) => {
    if (status === "CALL_CONFIRMED") return styles.statusSuccess;
    if (status === "CALL_ABANDONED") return styles.statusDanger;
    return styles.statusNeutral;
  };

  const formataDuracao = (segundos: number) => {
    if (!segundos) return "0s";
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <main className={styles.main}>
      <section className={styles.filterContainer}>
        <DateTimeInput 
          label="Data e Hora de Início"
          value={valueStartDate}
          placeholder="30/06/2026 00:00"
          onChange={setValueStartDate}
        />

        <DateTimeInput 
          label="Data e Hora de Fim"
          value={valueEndDate}
          placeholder="30/06/2026 23:59"
          onChange={setValueEndDate}
        />

        <button 
          className={styles.searchButton}
          onClick={() => sendDate(valueStartDate, valueEndDate)} 
          disabled={carregando}
        >
          {carregando ? "Analisando Páginas..." : "Buscar chamadas no período"}
        </button> 
      </section>

      <h1 className={styles.title}>Ligações encontradas</h1>
      <p>Total de ligações do periodo filtrado: {apiDados.length}</p>
      <br />
      
      {apiDados.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhuma ligação encontrada para este período ou busca não realizada.</p>
        </div>
      ) : (
        <div className={styles.dashboardContainer}>
          
          <div className={styles.chartWrapper}>
            <h2 className={styles.chartTitle}><Phone size={20} color="#6b46c1"/> Distribuição Geral de Status</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={dadosPizza}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dadosPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[entry.name as keyof typeof CORES] || CORES.OUTROS} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, getStatusLabel(name as string)]}/>
                  <Legend formatter={(value) => getStatusLabel(value)}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.chartWrapper}>
            <h2 className={styles.chartTitle}><Users size={20} color="#6b46c1"/> Desempenho de Ligações por Agente</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={dadosAgente} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#718096" />
                  <YAxis stroke="#718096" />
                  <Tooltip />
                  <Legend formatter={(value) => getStatusLabel(value)}/>
                  <Bar dataKey="CALL_CONFIRMED" stackId="a" fill={CORES.CALL_CONFIRMED} name="Atendida" />
                  <Bar dataKey="CALL_ABANDONED" stackId="a" fill={CORES.CALL_ABANDONED} name="Abandonada" />
                  <Bar dataKey="CALL_NOT_ATTENDED" stackId="a" fill={CORES.CALL_NOT_ATTENDED} name="Não Atendida" />
                  <Bar dataKey="CALL_CANCELED" stackId="a" fill={CORES.OUTROS} name="Cancelada" />
                  <Bar dataKey="CALL_FAILED" stackId="a" fill={CORES.CALL_FAILED} name="Falha" />
                  <Bar dataKey="BUSY" stackId="a" fill={CORES.BUSY} name="Ocupado" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.reportWrapper}>
            <h2 className={styles.chartTitle}><FileText size={20} color="#6b46c1"/> Relatório Consolidado de Chamadas</h2>
            <div className={styles.tableResponsive}>
              <table className={styles.reportTable}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Cliente / Número</th>
                    <th>Agente / Ramal</th>
                    <th>Equipe</th>
                    <th>Tipo</th>
                    <th>Duração</th>
                    <th>Quem Desligou</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ligacoesPaginadas.map((call) => (
                    <tr key={call.callId}>
                      <td className={styles.textMuted}>
                        {call.date ? new Date(call.date).toLocaleString('pt-BR') : "N/A"}
                      </td>
                      <td>
                        <div className={styles.boldText}>{call.contactName || "Desconhecido"}</div>
                        <div className={styles.subText}>{call.contactNumber}</div>
                      </td>
                      <td>
                        <div className={styles.boldText}>{call.userName || "N/A"}</div>
                        <div className={styles.subText}>Ramal: {call.ramal || "-"}</div>
                      </td>
                      <td>{call.teamName || "Suporte/Geral"}</td>
                      <td>
                        {call.type?.toLowerCase() === "inbound" ? (
                          <span className={`${styles.typeBadge} ${styles.inbound}`}>
                            <ArrowDownLeft size={14}/> Receptiva
                          </span>
                        ) : (
                          <span className={`${styles.typeBadge} ${styles.outbound}`}>
                            <ArrowUpRight size={14}/> Ativa
                          </span>
                        )}
                      </td>
                      <td className={styles.boldText}>{formataDuracao(call.totalDuration)}</td>
                      <td className={styles.textCapitalize}>
                        {call.hangup === "Fila" ? "Desistiu na fila" : call.hangup === "Contato" ? "Cliente desligou" : call.hangup === "Ramal" ? "Analista desligou" : ""}
                        </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusStyle(call.status)}`}>
                          {getStatusLabel(call.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPaginasTabela > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 0.5rem' }}>
                <span className={styles.textMuted} style={{ fontSize: '0.9rem' }}>
                  Exibindo página <strong>{paginaAtualTabela}</strong> de <strong>{totalPaginasTabela}</strong> ({apiDados.length} registros no total)
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setPaginaAtualTabela(prev => Math.max(prev - 1, 1))}
                    disabled={paginaAtualTabela === 1}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: paginaAtualTabela === 1 ? '#edf2f7' : '#6b46c1',
                      color: paginaAtualTabela === 1 ? '#a0aec0' : '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: paginaAtualTabela === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <button
                    onClick={() => setPaginaAtualTabela(prev => Math.min(prev + 1, totalPaginasTabela))}
                    disabled={paginaAtualTabela === totalPaginasTabela}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: paginaAtualTabela === totalPaginasTabela ? '#edf2f7' : '#6b46c1',
                      color: paginaAtualTabela === totalPaginasTabela ? '#a0aec0' : '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: paginaAtualTabela === totalPaginasTabela ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    Próxima <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
            <br />
            <h5>Relatório desenvolvido por: Yuri Suporte Pleno.</h5>
          </div>

        </div>
      )}
    </main>
  );
}