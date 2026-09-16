function salvarLancamento(payload) {
  validateLancamento_(payload);

  const contas = getPlanoContas_();
  const conta = contas.find(c => c.id === String(payload.contaId));
  if (!conta) throw new Error('Conta não encontrada.');

  const formas = getFormasPagamento_();
  const forma = formas.find(f => f.id === String(payload.formaPagamentoId));
  if (!forma) throw new Error('Forma de pagamento não encontrada.');

  const dataBase = parseDateInput_(payload.dataLancamento);
  const competenciaBase = payload.competencia || competenceFromDate_(dataBase);
  const total = Number(payload.valor);
  const qtd = payload.parcelado ? Math.max(1, Number(payload.totalParcelas || 1)) : 1;
  const idParcelamento = qtd > 1 ? newId_('PARC') : '';
  const valores = splitMoney_(total, qtd);
  const anexoUrl = payload.anexo ? salvarAnexo_(payload.anexo, competenciaBase) : '';
  const agora = new Date();
  const usuario = Session.getActiveUser().getEmail() || '';

  const compartilhado = !!payload.compartilhado;
  const divisao = payload.tipoDivisao === 'PERSONALIZADA';
  let pMatheus = compartilhado ? (divisao ? Number(payload.percMatheus || 0) : 50) : 0;
  let pCassia = compartilhado ? (divisao ? Number(payload.percCassia || 0) : 50) : 0;

  if (compartilhado && Math.abs((pMatheus + pCassia) - 100) > 0.01) {
    throw new Error('A divisão do gasto compartilhado deve totalizar 100%.');
  }

  const rows = [];
  for (let i=0; i<qtd; i++) {
    const dataParcela = addMonthsClamped_(dataBase, i);
    const competencia = addMonthsCompetence_(competenciaBase, i);
    const [ano, mes] = competencia.split('-').map(Number);

    rows.push({
      ID: newId_('LAN'),
      DATA_CADASTRO: agora,
      DATA_LANCAMENTO: dataParcela,
      COMPETENCIA: competencia,
      ANO: ano,
      MES: mes,
      PESSOA: payload.pessoa,
      NATUREZA: payload.natureza,
      CONTA_ID: conta.id,
      CONTA: conta.conta,
      GRUPO: conta.grupo,
      SUBGRUPO: conta.subgrupo,
      FORMA_PAGAMENTO_ID: forma.id,
      FORMA_PAGAMENTO: forma.nome,
      VALOR: valores[i],
      COMPARTILHADO: compartilhado ? 'SIM' : 'NÃO',
      PAGO_POR: compartilhado ? (payload.pagoPor || payload.pessoa) : '',
      PERC_MATHEUS: pMatheus,
      PERC_CASSIA: pCassia,
      STATUS_ACERTO: compartilhado ? (payload.statusAcerto || 'Pendente') : '',
      DATA_ACERTO: '',
      PARCELADO: qtd > 1 ? 'SIM' : 'NÃO',
      ID_PARCELAMENTO: idParcelamento,
      PARCELA_ATUAL: qtd > 1 ? i+1 : '',
      TOTAL_PARCELAS: qtd > 1 ? qtd : '',
      OBSERVACAO: String(payload.observacao || ''),
      ANEXO_URL: anexoUrl,
      USUARIO_REGISTRO: usuario
    });
  }

  appendObjects_('LANCAMENTOS', rows);
  return {ok:true, quantidade:qtd, ids:rows.map(r => r.ID)};
}

function validateLancamento_(p) {
  if (!p) throw new Error('Dados do lançamento não informados.');
  ['dataLancamento','pessoa','natureza','contaId','formaPagamentoId','valor'].forEach(k => {
    if (p[k] === undefined || p[k] === null || p[k] === '') throw new Error('Campo obrigatório: ' + k);
  });
  if (!['Receita','Despesa','Resultado'].includes(String(p.natureza))) throw new Error('Natureza inválida.');
  const v = Number(p.valor);
  if (!(v > 0)) throw new Error('O valor deve ser maior que zero.');
  if (p.parcelado && Number(p.totalParcelas) < 2) throw new Error('Informe pelo menos 2 parcelas.');
}

function splitMoney_(total, qtd) {
  const cents = Math.round(Number(total) * 100);
  const base = Math.floor(cents / qtd);
  const resto = cents - base*qtd;
  return Array.from({length:qtd}, (_,i) => (base + (i < resto ? 1 : 0)) / 100);
}

function salvarAnexo_(anexo, competencia) {
  if (!anexo || !anexo.data) return '';
  const props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty('ANEXOS_FOLDER_ID');
  const root = folderId ? DriveApp.getFolderById(folderId) : getOrCreateFolder_('Financas_Casal_Anexos');

  const [ano, mes] = competencia.split('-');
  const yearFolder = getChildFolder_(root, ano);
  const monthFolder = getChildFolder_(yearFolder, mes);

  const bytes = Utilities.base64Decode(String(anexo.data).split(',').pop());
  const blob = Utilities.newBlob(bytes, anexo.mimeType || 'application/octet-stream', anexo.name || ('anexo-' + Date.now()));
  return monthFolder.createFile(blob).getUrl();
}

function getChildFolder_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function getLancamentos(filters) {
  filters = filters || {};
  const rows = sheetToObjects_('LANCAMENTOS').map(r => ({
    id:String(r.ID),
    dataCadastro:toIsoDate_(r.DATA_CADASTRO),
    dataLancamento:toIsoDate_(r.DATA_LANCAMENTO),
    competencia:String(r.COMPETENCIA || ''),
    pessoa:String(r.PESSOA || ''),
    natureza:String(r.NATUREZA || ''),
    contaId:String(r.CONTA_ID || ''),
    conta:String(r.CONTA || ''),
    grupo:String(r.GRUPO || ''),
    subgrupo:String(r.SUBGRUPO || ''),
    formaPagamento:String(r.FORMA_PAGAMENTO || ''),
    valor:Number(r.VALOR || 0),
    compartilhado:norm_(r.COMPARTILHADO) === 'SIM',
    pagoPor:String(r.PAGO_POR || ''),
    percMatheus:Number(r.PERC_MATHEUS || 0),
    percCassia:Number(r.PERC_CASSIA || 0),
    statusAcerto:String(r.STATUS_ACERTO || ''),
    parcelado:norm_(r.PARCELADO) === 'SIM',
    idParcelamento:String(r.ID_PARCELAMENTO || ''),
    parcelaAtual:r.PARCELA_ATUAL || '',
    totalParcelas:r.TOTAL_PARCELAS || '',
    observacao:String(r.OBSERVACAO || ''),
    anexoUrl:String(r.ANEXO_URL || '')
  }));

  return rows
    .filter(r => !filters.competencia || r.competencia === filters.competencia)
    .filter(r => !filters.pessoa || r.pessoa === filters.pessoa)
    .filter(r => !filters.natureza || r.natureza === filters.natureza)
    .filter(r => !filters.grupo || r.grupo === filters.grupo)
    .filter(r => !filters.formaPagamento || r.formaPagamento === filters.formaPagamento)
    .sort((a,b) => (b.dataLancamento + b.id).localeCompare(a.dataLancamento + a.id));
}

function excluirLancamento(id) {
  const sh = getDb_().getSheetByName('LANCAMENTOS');
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const idx = headers.indexOf('ID');
  for (let i=data.length-1; i>=1; i--) {
    if (String(data[i][idx]) === String(id)) {
      sh.deleteRow(i+1);
      return {ok:true};
    }
  }
  throw new Error('Lançamento não encontrado.');
}

function quitarCompartilhamento(id) {
  const sh = getDb_().getSheetByName('LANCAMENTOS');
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('ID');
  const statusCol = headers.indexOf('STATUS_ACERTO');
  const dateCol = headers.indexOf('DATA_ACERTO');
  for (let i=1; i<data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      sh.getRange(i+1,statusCol+1).setValue('Pago');
      sh.getRange(i+1,dateCol+1).setValue(new Date());
      return {ok:true};
    }
  }
  throw new Error('Lançamento não encontrado.');
}
