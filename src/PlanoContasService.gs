function salvarConta(payload) {
  if (!payload || !payload.classificacao || !payload.conta) throw new Error('Classificação e conta são obrigatórias.');
  const sh = getDb_().getSheetByName('PLANO_CONTAS');
  const row = {
    ID: payload.id || newId_('CTA'),
    CLASSIFICACAO: payload.classificacao,
    TIPO_CONTA: payload.tipoConta || '',
    GRUPO: payload.grupo || '',
    SUBGRUPO: payload.subgrupo || '',
    CONTA: payload.conta,
    PESSOA_PADRAO: payload.pessoaPadrao || '',
    COMPARTILHAVEL: payload.compartilhavel ? 'SIM' : 'NÃO',
    ATIVO: payload.ativo === false ? 'NÃO' : 'SIM'
  };

  if (payload.id) {
    const data = sh.getDataRange().getValues();
    const headers = data[0].map(String);
    const idCol = headers.indexOf('ID');
    for (let i=1;i<data.length;i++) {
      if (String(data[i][idCol]) === String(payload.id)) {
        sh.getRange(i+1,1,1,headers.length).setValues([objectToRow_(headers,row)]);
        return {ok:true,id:row.ID};
      }
    }
  }

  appendObjects_('PLANO_CONTAS',[row]);
  return {ok:true,id:row.ID};
}

function listarContas() {
  return getPlanoContas_();
}


function excluirConta(id) {
  if (!id) throw new Error('Conta não informada.');
  const sh = getDb_().getSheetByName('PLANO_CONTAS');
  const data = sh.getDataRange().getValues();
  if (!data.length) throw new Error('Plano de contas vazio.');

  const headers = data[0].map(String);
  const idCol = headers.indexOf('ID');
  const ativoCol = headers.indexOf('ATIVO');
  if (idCol < 0 || ativoCol < 0) throw new Error('Estrutura do plano de contas inválida.');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      // Exclusão lógica: preserva lançamentos históricos vinculados à conta.
      sh.getRange(i + 1, ativoCol + 1).setValue('NÃO');
      return {ok:true, id:String(id)};
    }
  }
  throw new Error('Conta não encontrada.');
}
