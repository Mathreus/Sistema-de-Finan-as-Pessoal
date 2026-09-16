function getDashboard(filters) {
  filters = filters || {};
  const competencia = filters.competencia || Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Recife', 'yyyy-MM');
  const pessoa = filters.pessoa || '';
  const lanc = getLancamentos({competencia, pessoa});

  let receitas = 0, despesas = 0, resultados = 0;
  const despGrupo = {}, recGrupo = {};
  lanc.forEach(r => {
    if (r.natureza === 'Receita') {
      receitas += r.valor;
      recGrupo[r.grupo || 'Outros'] = (recGrupo[r.grupo || 'Outros'] || 0) + r.valor;
    } else if (r.natureza === 'Despesa') {
      despesas += r.valor;
      despGrupo[r.grupo || 'Outros'] = (despGrupo[r.grupo || 'Outros'] || 0) + r.valor;
    } else {
      resultados += r.valor;
    }
  });

  const plan = getPlanejamento(competencia);
  const receitaEstimada = Number(plan.receitaEstimada || receitas);
  const metaInvestimento = Number(plan.metaInvestimento || 0);
  const reserva = Number(plan.reserva || 0);
  const limiteDespesa = Math.max(0, receitaEstimada - metaInvestimento - reserva);
  const disponivel = limiteDespesa - despesas;

  const evolucao = getEvolucaoMensal_(pessoa, 6);
  const porPessoa = getComparacaoPessoas_(competencia);

  return {
    competencia,
    pessoa,
    receitas,
    despesas,
    resultado: receitas - despesas,
    resultados,
    receitaEstimada,
    metaInvestimento,
    reserva,
    limiteDespesa,
    disponivel,
    taxaPoupanca: receitas ? ((receitas - despesas) / receitas) * 100 : 0,
    topDespesas: objectTop_(despGrupo, 8),
    topReceitas: objectTop_(recGrupo, 8),
    evolucao,
    porPessoa,
    totalLancamentos:lanc.length
  };
}

function objectTop_(obj, n) {
  return Object.keys(obj).map(k => ({nome:k, valor:obj[k]})).sort((a,b)=>b.valor-a.valor).slice(0,n);
}

function getEvolucaoMensal_(pessoa, quantidade) {
  const all = getLancamentos({});
  const hoje = new Date();
  const competencias = [];
  for (let i=quantidade-1;i>=0;i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth()-i, 1, 12,0,0);
    competencias.push(Utilities.formatDate(d, Session.getScriptTimeZone() || 'America/Recife', 'yyyy-MM'));
  }
  return competencias.map(c => {
    let receita=0, despesa=0;
    all.filter(r => r.competencia===c && (!pessoa || r.pessoa===pessoa)).forEach(r => {
      if (r.natureza==='Receita') receita += r.valor;
      if (r.natureza==='Despesa') despesa += r.valor;
    });
    return {competencia:c, receita, despesa};
  });
}

function getComparacaoPessoas_(competencia) {
  const pessoas = getPessoas_();
  const all = getLancamentos({competencia});
  return pessoas.map(p => {
    let receita=0, despesa=0;
    all.filter(r => r.pessoa===p.nome).forEach(r => {
      if (r.natureza==='Receita') receita += r.valor;
      if (r.natureza==='Despesa') despesa += r.valor;
    });
    return {pessoa:p.nome, receita, despesa, resultado:receita-despesa};
  });
}

function getPlanejamento(competencia) {
  const rows = sheetToObjects_('PLANEJAMENTO');
  const r = rows.find(x => String(x.COMPETENCIA) === String(competencia));
  return r ? {
    competencia:String(r.COMPETENCIA),
    receitaEstimada:Number(r.RECEITA_ESTIMADA || 0),
    metaInvestimento:Number(r.META_INVESTIMENTO || 0),
    reserva:Number(r.RESERVA || 0),
    observacao:String(r.OBSERVACAO || '')
  } : {competencia, receitaEstimada:0, metaInvestimento:0, reserva:0, observacao:''};
}

function salvarPlanejamento(payload) {
  if (!payload || !payload.competencia) throw new Error('Competência obrigatória.');
  const sh = getDb_().getSheetByName('PLANEJAMENTO');
  const data = sh.getDataRange().getValues();
  const headers = data[0].map(String);
  const compCol = headers.indexOf('COMPETENCIA');
  const obj = {
    COMPETENCIA: payload.competencia,
    RECEITA_ESTIMADA: Number(payload.receitaEstimada || 0),
    META_INVESTIMENTO: Number(payload.metaInvestimento || 0),
    RESERVA: Number(payload.reserva || 0),
    OBSERVACAO: payload.observacao || ''
  };

  for (let i=1;i<data.length;i++) {
    if (String(data[i][compCol]) === String(payload.competencia)) {
      sh.getRange(i+1,1,1,headers.length).setValues([objectToRow_(headers,obj)]);
      return {ok:true};
    }
  }
  appendObjects_('PLANEJAMENTO',[obj]);
  return {ok:true};
}

function getAcertoCompartilhado(competencia) {
  const lanc = getLancamentos({competencia}).filter(r => r.compartilhado && r.statusAcerto !== 'Pago');
  let saldoMatheus = 0; // positivo = Cássia deve a Matheus
  lanc.forEach(r => {
    const quotaMatheus = r.valor * (r.percMatheus/100);
    const quotaCassia = r.valor * (r.percCassia/100);
    if (r.pagoPor === 'Matheus') saldoMatheus += quotaCassia;
    if (r.pagoPor === 'Cássia') saldoMatheus -= quotaMatheus;
  });
  return {saldoMatheus};
}
