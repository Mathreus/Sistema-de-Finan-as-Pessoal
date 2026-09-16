const APP_NAME = 'Finanças do Casal';

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle(APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function setupSistema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Abra a planilha e execute setupSistema() a partir do Apps Script vinculado a ela.');

  PropertiesService.getScriptProperties().setProperty('DB_ID', ss.getId());

  ensureSheet_('PESSOAS', ['ID','NOME','ATIVO']);
  ensureSheet_('FORMAS_PAGAMENTO', ['ID','NOME','TIPO','TITULAR','DIA_FECHAMENTO','DIA_VENCIMENTO','ATIVO']);
  ensureSheet_('PLANO_CONTAS', ['ID','CLASSIFICACAO','TIPO_CONTA','GRUPO','SUBGRUPO','CONTA','PESSOA_PADRAO','COMPARTILHAVEL','ATIVO']);
  ensureSheet_('LANCAMENTOS', [
    'ID','DATA_CADASTRO','DATA_LANCAMENTO','COMPETENCIA','ANO','MES','PESSOA','NATUREZA',
    'CONTA_ID','CONTA','GRUPO','SUBGRUPO','FORMA_PAGAMENTO_ID','FORMA_PAGAMENTO','VALOR',
    'COMPARTILHADO','PAGO_POR','PERC_MATHEUS','PERC_CASSIA','STATUS_ACERTO','DATA_ACERTO',
    'PARCELADO','ID_PARCELAMENTO','PARCELA_ATUAL','TOTAL_PARCELAS','OBSERVACAO','ANEXO_URL',
    'USUARIO_REGISTRO'
  ]);
  ensureSheet_('PLANEJAMENTO', ['COMPETENCIA','RECEITA_ESTIMADA','META_INVESTIMENTO','RESERVA','OBSERVACAO']);
  ensureSheet_('METAS', ['ID','NOME','VALOR_META','VALOR_ATUAL','PRAZO','STATUS']);

  seedIfEmpty_('PESSOAS', [
    ['P001','Matheus','SIM'],
    ['P002','Cássia','SIM']
  ]);

  seedIfEmpty_('FORMAS_PAGAMENTO', [
    ['FP001','Cartão Azul Itaú','CARTAO_CREDITO','','','','SIM'],
    ['FP002','Cartão de crédito Nubank','CARTAO_CREDITO','','','','SIM'],
    ['FP003','PIX','PIX','','','','SIM'],
    ['FP004','Dinheiro','DINHEIRO','','','','SIM'],
    ['FP005','Caju','BENEFICIO','','','','SIM'],
    ['FP006','Pluxee','BENEFICIO','','','','SIM']
  ]);

  seedIfEmpty_('PLANO_CONTAS', [
    ['CTA001','Despesa','Despesa fixa','Moradia','Aluguel','Aluguel','','SIM','SIM'],
    ['CTA002','Despesa','Despesa variável','Moradia','Contas de consumo','Energia','','SIM','SIM'],
    ['CTA003','Despesa','Despesa variável','Moradia','Contas de consumo','Conta de Água','','SIM','SIM'],
    ['CTA004','Despesa','Despesa fixa','Moradia','Internet','Internet Vivo','','SIM','SIM'],
    ['CTA005','Despesa','Despesa variável','Moradia','Serviços domésticos','Lavanderia','','SIM','SIM'],
    ['CTA006','Despesa','Despesa variável','Alimentação','Mercado','Supermercado','','SIM','SIM'],
    ['CTA007','Despesa','Despesa variável','Alimentação','Mercado','Feira / Hortifruti','','SIM','SIM'],
    ['CTA008','Despesa','Despesa variável','Alimentação','Mercado','Água Mineral','','SIM','SIM'],
    ['CTA009','Despesa','Despesa variável','Alimentação','Refeições','Café da Manhã','','SIM','SIM'],
    ['CTA010','Despesa','Despesa variável','Alimentação','Refeições','Almoço','','SIM','SIM'],
    ['CTA011','Despesa','Despesa variável','Alimentação','Refeições','Jantar','','SIM','SIM'],
    ['CTA012','Despesa','Despesa variável','Alimentação','Delivery','iFood','','SIM','SIM'],
    ['CTA013','Despesa','Despesa variável','Alimentação','Restaurantes','Restaurante','','SIM','SIM'],
    ['CTA014','Despesa','Despesa variável','Alimentação','Lanches','Padaria / Lanchonete','','SIM','SIM'],
    ['CTA015','Despesa','Despesa variável','Transporte','Mobilidade','Uber','','SIM','SIM'],
    ['CTA016','Despesa','Despesa variável','Transporte','Mobilidade','BlaBlaCar','','SIM','SIM'],
    ['CTA017','Despesa','Despesa variável','Transporte','Mobilidade','Transporte Público','','SIM','SIM'],
    ['CTA018','Despesa','Despesa variável','Transporte','Veículo','Combustível','','SIM','SIM'],
    ['CTA019','Despesa','Despesa eventual','Transporte','Veículo','Aluguel de Veículo','','SIM','SIM'],
    ['CTA020','Despesa','Despesa variável','Transporte','Veículo','Estacionamento','','SIM','SIM'],
    ['CTA021','Despesa','Despesa fixa','Saúde','Plano de saúde','Plano de Saúde','','NÃO','SIM'],
    ['CTA022','Despesa','Despesa eventual','Saúde','Consultas','Consultas particulares','','NÃO','SIM'],
    ['CTA023','Despesa','Despesa eventual','Saúde','Exames','Exames','','NÃO','SIM'],
    ['CTA024','Despesa','Despesa variável','Saúde','Medicamentos','Farmácia','','NÃO','SIM'],
    ['CTA025','Despesa','Despesa fixa','Saúde e Bem-estar','Academia','Academia','','NÃO','SIM'],
    ['CTA026','Despesa','Despesa variável','Saúde e Bem-estar','Suplementação','Suplementos','','NÃO','SIM'],
    ['CTA027','Despesa','Despesa fixa','Educação','Pós-graduação','Pós Graduação (MBA)','','NÃO','SIM'],
    ['CTA028','Despesa','Despesa eventual','Educação','Cursos','Cursos Livres','','NÃO','SIM'],
    ['CTA029','Despesa','Despesa fixa','Assinaturas','Streaming','Netflix','','SIM','SIM'],
    ['CTA030','Despesa','Despesa fixa','Assinaturas','Streaming','Disney','','SIM','SIM'],
    ['CTA031','Despesa','Despesa fixa','Assinaturas','Streaming','HBO Max','','SIM','SIM'],
    ['CTA032','Despesa','Despesa fixa','Assinaturas','Streaming','Apple TV','','SIM','SIM'],
    ['CTA033','Despesa','Despesa fixa','Assinaturas','Streaming','GloboPlay','','SIM','SIM'],
    ['CTA034','Despesa','Despesa fixa','Assinaturas','Streaming','Amazon Prime','','SIM','SIM'],
    ['CTA035','Despesa','Despesa variável','Cuidados Pessoais','Cabelo','Corte de Cabelo / Barbeiro','','NÃO','SIM'],
    ['CTA036','Despesa','Despesa variável','Cuidados Pessoais','Vestuário','Roupas','','NÃO','SIM'],
    ['CTA037','Despesa','Despesa variável','Cuidados Pessoais','Cosméticos','Cosméticos','','NÃO','SIM'],
    ['CTA038','Despesa','Despesa variável','Cuidados Pessoais','Estética','Maquiagens / Unhas / Laser','','NÃO','SIM'],
    ['CTA039','Despesa','Despesa eventual','Lazer e Relacionamento','Presentes','Presentes','','SIM','SIM'],
    ['CTA040','Despesa','Despesa variável','Lazer e Relacionamento','Entretenimento','Cinema','','SIM','SIM'],
    ['CTA041','Despesa','Despesa variável','Hobbies','Colecionáveis','Bonecos','','NÃO','SIM'],
    ['CTA042','Despesa','Despesa eventual','Viagens','Viagem','Viagens','','SIM','SIM'],
    ['CTA043','Despesa','Despesa variável','Hobbies','Games','Jogos / Video Games','','NÃO','SIM'],
    ['CTA044','Despesa','Despesa variável','Educação','Livros','Livros','','NÃO','SIM'],
    ['CTA045','Despesa','Despesa fixa','Seguros','Seguro de vida','Seguro de Vida Nubank','','NÃO','SIM'],
    ['CTA046','Despesa','Despesa eventual','Viagens','Passagens','Passagens aéreas','','SIM','SIM'],
    ['CTA047','Despesa','Despesa fixa','Seguros','Seguro de celular','Seguro de Celular','','NÃO','SIM'],
    ['CTA048','Despesa','Despesa fixa','Seguros','Seguro de vida','Seguro de Vida','','NÃO','SIM'],
    ['CTA049','Despesa','Despesa eventual','Serviços Profissionais','Honorários','Honorários','','SIM','SIM'],
    ['CTA050','Despesa','Despesa eventual','Casa','Eletrodomésticos','Eletrodomésticos','','SIM','SIM'],
    ['CTA051','Despesa','Despesa eventual','Casa','Climatização','Ar condicionado','','SIM','SIM'],
    ['CTA052','Despesa','Despesa eventual','Eletrônicos','Dispositivos','Kindle','','NÃO','SIM'],
    ['CTA053','Despesa','Despesa fixa','Assinaturas','Armazenamento em nuvem','Assinatura OneDrive','','NÃO','SIM'],
    ['CTA054','Despesa','Despesa fixa','Assinaturas','Armazenamento em nuvem','Assinatura iCloud','','NÃO','SIM'],
    ['CTA055','Despesa','Despesa fixa','Assinaturas','Benefícios','iFood Benefícios','','NÃO','SIM'],
    ['CTA056','Despesa','Despesa fixa','Lazer e Relacionamento','Clube','Sócio Náutico','','NÃO','SIM'],
    ['CTA057','Despesa','Despesa financeira','Financeiro','Anuidade de cartão','Anuidade Itaú Azul','','NÃO','SIM'],
    ['CTA058','Despesa','Despesa variável','Cuidados Pessoais','Vestuário','Calçados','','NÃO','SIM'],
    ['CTA059','Despesa','Despesa variável','Cuidados Pessoais','Acessórios','Acessórios','','NÃO','SIM'],
    ['CTA060','Despesa','Despesa variável','Compras','Compras online','Compras Online','','NÃO','SIM'],
    ['CTA061','Despesa','Despesa variável','Outros','Diversos','Despesas Diversas','','SIM','SIM'],
    ['CTA062','Despesa','Despesa fixa','Educação','Financiamento estudantil','FIES','','NÃO','SIM'],
    ['CTA063','Receita','Renda ativa','Trabalho','Adiantamento salarial','Adiantamento salarial','','NÃO','SIM'],
    ['CTA064','Receita','Renda ativa','Trabalho','Salário','Salário','','NÃO','SIM'],
    ['CTA065','Receita','Receita extraordinária','Trabalho','PLR','Participação nos Lucros e Resultados','','NÃO','SIM'],
    ['CTA066','Receita','Receita extraordinária','Trabalho','13º Salário','13º Salário','','NÃO','SIM'],
    ['CTA067','Receita','Receita extraordinária','Trabalho','Férias','Férias','','NÃO','SIM'],
    ['CTA068','Receita','Receita extraordinária','Trabalho','Diárias e reembolsos','Diárias de Viagem','','NÃO','SIM'],
    ['CTA069','Receita','Benefício','Benefícios','Alimentação','Vale Alimentação','','NÃO','SIM'],
    ['CTA070','Receita','Benefício','Benefícios','Transporte','Vale Transporte','','NÃO','SIM'],
    ['CTA071','Receita','Renda ativa','Renda Extra','Consultorias','Consultorias','','NÃO','SIM'],
    ['CTA072','Receita','Renda passiva','Investimentos','Rendimentos','Juros de aplicações (CDI)','','NÃO','SIM'],
    ['CTA073','Receita','Reembolso','Compartilhamentos','Reembolso de despesas','Recebimento Gastos Compartilhados','','NÃO','SIM'],
    ['CTA074','Receita','Receita extraordinária','Outros','Receitas diversas','Receitas Diversas','','NÃO','SIM'],
    ['CTA075','Resultado','Investimentos','Patrimônio','Reserva e investimentos','Reserva / Investimentos','','SIM','SIM']
  ]);

  const anexos = getOrCreateFolder_('Financas_Casal_Anexos');
  const exports = getOrCreateFolder_('Financas_Casal_Exportacoes');
  const props = PropertiesService.getScriptProperties();
  props.setProperty('ANEXOS_FOLDER_ID', anexos.getId());
  props.setProperty('EXPORT_FOLDER_ID', exports.getId());

  formatSheets_();

  return {
    ok: true,
    mensagem: 'Estrutura criada com sucesso.',
    spreadsheetUrl: ss.getUrl(),
    anexosFolderUrl: anexos.getUrl(),
    exportFolderUrl: exports.getUrl()
  };
}

function getBootstrapData() {
  return {
    pessoas: getPessoas_(),
    formasPagamento: getFormasPagamento_(),
    contas: getPlanoContas_(),
    competenciaAtual: Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Recife', 'yyyy-MM'),
    dashboard: getDashboard({competencia: Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Recife', 'yyyy-MM'), pessoa: ''}),
    lancamentos: getLancamentos({competencia: Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Recife', 'yyyy-MM')}).slice(0, 50),
    planejamento: getPlanejamento(Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Recife', 'yyyy-MM'))
  };
}
