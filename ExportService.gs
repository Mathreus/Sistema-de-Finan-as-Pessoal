function exportLancamentosExcel(filters) {
  const rows = getLancamentos(filters || {});
  if (!rows.length) throw new Error('Não há lançamentos para exportar.');

  const temp = SpreadsheetApp.create('Export_Financas_' + Date.now());
  const sh = temp.getSheets()[0];
  sh.setName('Lancamentos');

  const headers = [
    'Data','Competência','Pessoa','Natureza','Conta','Grupo','Subgrupo','Forma de Pagamento',
    'Valor','Compartilhado','Pago por','Status Acerto','Parcela','Observação','Anexo'
  ];
  const values = rows.map(r => [
    r.dataLancamento, r.competencia, r.pessoa, r.natureza, r.conta, r.grupo, r.subgrupo,
    r.formaPagamento, r.valor, r.compartilhado ? 'SIM':'NÃO', r.pagoPor, r.statusAcerto,
    r.parcelado ? (r.parcelaAtual + '/' + r.totalParcelas) : '', r.observacao, r.anexoUrl
  ]);

  sh.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold');
  sh.getRange(2,1,values.length,headers.length).setValues(values);
  sh.getRange(2,9,values.length,1).setNumberFormat('R$ #,##0.00');
  sh.autoResizeColumns(1,headers.length);
  SpreadsheetApp.flush();

  const token = ScriptApp.getOAuthToken();
  const url = 'https://docs.google.com/spreadsheets/d/' + temp.getId() + '/export?format=xlsx';
  const response = UrlFetchApp.fetch(url, {headers:{Authorization:'Bearer ' + token}});
  const blob = response.getBlob().setName('Lancamentos_' + (filters && filters.competencia ? filters.competencia : 'Todos') + '.xlsx');

  const folderId = PropertiesService.getScriptProperties().getProperty('EXPORT_FOLDER_ID');
  const folder = folderId ? DriveApp.getFolderById(folderId) : getOrCreateFolder_('Financas_Casal_Exportacoes');
  const file = folder.createFile(blob);

  DriveApp.getFileById(temp.getId()).setTrashed(true);
  return {ok:true, url:file.getUrl(), nome:file.getName()};
}
