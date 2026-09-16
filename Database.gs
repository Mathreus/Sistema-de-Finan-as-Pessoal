/**
 * Camada de acesso ao Google Sheets.
 * Inclui controle de concorrência com LockService.
 */

function getDb_() {
  const id = PropertiesService.getScriptProperties().getProperty('DB_ID');

  if (!id) {
    throw new Error(
      'Sistema não inicializado. Execute setupSistema() uma vez na planilha.'
    );
  }

  return SpreadsheetApp.openById(id);
}


function getDbFallback_() {
  const id = PropertiesService.getScriptProperties().getProperty('DB_ID');

  if (id) {
    return SpreadsheetApp.openById(id);
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();

  if (!active) {
    throw new Error('Nenhuma planilha ativa.');
  }

  return active;
}


function ensureSheet_(name, headers) {
  const ss = getDbFallback_();
  let sh = ss.getSheetByName(name);

  if (!sh) {
    sh = ss.insertSheet(name);
  }

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const current = sh
      .getRange(
        1,
        1,
        1,
        Math.max(sh.getLastColumn(), headers.length)
      )
      .getValues()[0];

    headers.forEach(function(header, index) {
      if (current[index] !== header) {
        sh.getRange(1, index + 1).setValue(header);
      }
    });
  }

  sh.setFrozenRows(1);
  return sh;
}


function seedIfEmpty_(sheetName, rows) {
  const sh = getDbFallback_().getSheetByName(sheetName);

  if (sh.getLastRow() <= 1 && rows.length) {
    sh
      .getRange(2, 1, rows.length, rows[0].length)
      .setValues(rows);
  }
}


function formatSheets_() {
  const ss = getDbFallback_();

  [
    'PESSOAS',
    'FORMAS_PAGAMENTO',
    'PLANO_CONTAS',
    'LANCAMENTOS',
    'PLANEJAMENTO',
    'METAS'
  ].forEach(function(name) {
    const sh = ss.getSheetByName(name);

    if (!sh) {
      return;
    }

    const lastColumn = sh.getLastColumn();

    if (lastColumn) {
      sh
        .getRange(1, 1, 1, lastColumn)
        .setFontWeight('bold');

      sh.autoResizeColumns(1, lastColumn);
    }
  });

  const lancamentos = ss.getSheetByName('LANCAMENTOS');

  if (lancamentos) {
    const headers = lancamentos
      .getRange(1, 1, 1, lancamentos.getLastColumn())
      .getValues()[0];

    const valorCol = headers.indexOf('VALOR') + 1;
    const competenciaCol = headers.indexOf('COMPETENCIA') + 1;

    if (valorCol > 0 && lancamentos.getMaxRows() > 1) {
      lancamentos
        .getRange(2, valorCol, lancamentos.getMaxRows() - 1, 1)
        .setNumberFormat('R$ #,##0.00');
    }

    // Evita que "2026-09" seja convertido automaticamente em data.
    if (competenciaCol > 0 && lancamentos.getMaxRows() > 1) {
      lancamentos
        .getRange(2, competenciaCol, lancamentos.getMaxRows() - 1, 1)
        .setNumberFormat('@');
    }
  }

  const planejamento = ss.getSheetByName('PLANEJAMENTO');

  if (planejamento) {
    const headers = planejamento
      .getRange(1, 1, 1, planejamento.getLastColumn())
      .getValues()[0];

    const competenciaCol = headers.indexOf('COMPETENCIA') + 1;

    if (competenciaCol > 0 && planejamento.getMaxRows() > 1) {
      planejamento
        .getRange(2, competenciaCol, planejamento.getMaxRows() - 1, 1)
        .setNumberFormat('@');
    }
  }
}


function sheetToObjects_(sheetName) {
  const sh = getDb_().getSheetByName(sheetName);

  if (!sh || sh.getLastRow() < 2) {
    return [];
  }

  const values = sh.getDataRange().getValues();
  const headers = values.shift().map(String);

  return values
    .filter(function(row) {
      return row.some(function(value) {
        return value !== '' && value !== null;
      });
    })
    .map(function(row) {
      const obj = {};

      headers.forEach(function(header, index) {
        obj[header] = row[index];
      });

      return obj;
    });
}


function objectToRow_(headers, obj) {
  return headers.map(function(header) {
    return obj[header] === undefined ? '' : obj[header];
  });
}


/**
 * Grava objetos em uma aba de forma segura para uso simultâneo.
 *
 * O ScriptLock impede que dois usuários calculem a mesma próxima
 * linha e gravem um por cima do outro.
 */
function appendObjects_(sheetName, objects) {
  if (!objects || !objects.length) {
    return;
  }

  const lock = LockService.getScriptLock();
  let lockObtido = false;

  try {
    lock.waitLock(30000);
    lockObtido = true;

    const sh = getDb_().getSheetByName(sheetName);

    if (!sh) {
      throw new Error('Aba não encontrada: ' + sheetName);
    }

    const headers = sh
      .getRange(1, 1, 1, sh.getLastColumn())
      .getValues()[0]
      .map(String);

    const rows = objects.map(function(obj) {
      return objectToRow_(headers, obj);
    });

    // A próxima linha é calculada somente depois de obter o lock.
    const nextRow = sh.getLastRow() + 1;

    if (sheetName === 'LANCAMENTOS' || sheetName === 'PLANEJAMENTO') {
      const competenciaCol = headers.indexOf('COMPETENCIA');

      if (competenciaCol >= 0) {
        sh
          .getRange(
            nextRow,
            competenciaCol + 1,
            rows.length,
            1
          )
          .setNumberFormat('@');
      }
    }

    sh
      .getRange(
        nextRow,
        1,
        rows.length,
        headers.length
      )
      .setValues(rows);

    SpreadsheetApp.flush();

  } catch (error) {
    throw new Error(
      'Não foi possível concluir a gravação. Tente novamente. Detalhe: '
      + error.message
    );

  } finally {
    if (lockObtido) {
      lock.releaseLock();
    }
  }
}


function getPessoas_() {
  return sheetToObjects_('PESSOAS')
    .filter(function(item) {
      return norm_(item.ATIVO) !== 'NAO';
    })
    .map(function(item) {
      return {
        id: String(item.ID),
        nome: String(item.NOME)
      };
    });
}


function getFormasPagamento_() {
  return sheetToObjects_('FORMAS_PAGAMENTO')
    .filter(function(item) {
      return norm_(item.ATIVO) !== 'NAO';
    })
    .map(function(item) {
      return {
        id: String(item.ID),
        nome: String(item.NOME),
        tipo: String(item.TIPO || ''),
        titular: String(item.TITULAR || ''),
        fechamento: item.DIA_FECHAMENTO || '',
        vencimento: item.DIA_VENCIMENTO || ''
      };
    });
}


function getPlanoContas_() {
  return sheetToObjects_('PLANO_CONTAS')
    .filter(function(item) {
      return norm_(item.ATIVO) !== 'NAO';
    })
    .map(function(item) {
      return {
        id: String(item.ID),
        classificacao: String(item.CLASSIFICACAO),
        tipoConta: String(item.TIPO_CONTA || ''),
        grupo: String(item.GRUPO || ''),
        subgrupo: String(item.SUBGRUPO || ''),
        conta: String(item.CONTA || ''),
        pessoaPadrao: String(item.PESSOA_PADRAO || ''),
        compartilhavel: norm_(item.COMPARTILHAVEL) === 'SIM'
      };
    });
}


function norm_(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}


function newId_(prefix) {
  const timezone =
    Session.getScriptTimeZone() || 'America/Recife';

  return (
    prefix
    + '-'
    + Utilities.formatDate(
        new Date(),
        timezone,
        'yyyyMMddHHmmss'
      )
    + '-'
    + Utilities.getUuid().slice(0, 8)
  );
}


function parseDateInput_(value) {
  if (value instanceof Date) {
    return value;
  }

  const parts = String(value || '')
    .split('-')
    .map(Number);

  if (parts.length !== 3) {
    throw new Error('Data inválida.');
  }

  return new Date(
    parts[0],
    parts[1] - 1,
    parts[2],
    12,
    0,
    0
  );
}


function competenceFromDate_(date) {
  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone() || 'America/Recife',
    'yyyy-MM'
  );
}


function addMonthsClamped_(date, months) {
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const day = date.getDate();
  const lastDay = new Date(year, month + 1, 0).getDate();

  return new Date(
    year,
    month,
    Math.min(day, lastDay),
    12,
    0,
    0
  );
}


function addMonthsCompetence_(competencia, months) {
  const parts = String(competencia)
    .split('-')
    .map(Number);

  const date = new Date(
    parts[0],
    parts[1] - 1 + months,
    1,
    12,
    0,
    0
  );

  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone() || 'America/Recife',
    'yyyy-MM'
  );
}


function toIsoDate_(value) {
  if (!value) {
    return '';
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (isNaN(date.getTime())) {
    return String(value);
  }

  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone() || 'America/Recife',
    'yyyy-MM-dd'
  );
}


function getOrCreateFolder_(name) {
  const iterator = DriveApp.getFoldersByName(name);

  return iterator.hasNext()
    ? iterator.next()
    : DriveApp.createFolder(name);
}