/**
 * 预警引擎（小程序内运行版本）。
 *
 * 和 engine/sjia_engine/*.py 是同一套逻辑，逐条对齐；判定标准来自
 * ./standards.js（由 engine/standards.toml 自动生成）。
 *
 * 为什么要搬一份到小程序里：真机演示时手机不该依赖电脑上的接口——
 * 不用连同一个 Wi-Fi、不用放行防火墙，电脑关着也能演。
 *
 * 两边的结果由 engine/scripts/check_parity.py 逐例比对，改任何一边都要跑它。
 */

const standards = require('./standards');

// ---------------------------------------------------------------------------
// 单位换算
// ---------------------------------------------------------------------------

const UNIT_FACTORS = {
  ferritin: { 'ng/ml': 1.0, 'ug/l': 1.0 },
  platelet: { '10^9/l': 1.0 },
  ast: { 'u/l': 1.0 },
  alt: { 'u/l': 1.0 },
  ldh: { 'u/l': 1.0 },
  bilirubin: { 'umol/l': 1.0, 'mg/dl': 17.1 },
  fibrinogen: { 'mg/dl': 1.0, 'g/l': 100.0 },
  triglyceride: { 'mg/dl': 1.0, 'mmol/l': 88.57 },
  esr: { 'mm/h': 1.0 },
  crp: { 'mg/l': 1.0 },
  wbc: { '10^9/l': 1.0 },
  neutrophil: { '10^9/l': 1.0 },
  hemoglobin: { 'g/l': 1.0 },
  pt: { s: 1.0, sec: 1.0 },
  aptt: { s: 1.0, sec: 1.0 },
  d_dimer: { 'mg/l': 1.0, 'ug/ml': 1.0, 'ng/ml': 0.001 },
  cd163: { 'ng/ml': 1.0, 'mg/l': 1000.0 }
};

const INTERNAL_UNITS = {
  ferritin: 'ng/mL',
  platelet: '10^9/L',
  ast: 'U/L',
  alt: 'U/L',
  ldh: 'U/L',
  bilirubin: 'umol/L',
  fibrinogen: 'mg/dL',
  triglyceride: 'mg/dL',
  esr: 'mm/h',
  crp: 'mg/L',
  wbc: '10^9/L',
  neutrophil: '10^9/L',
  hemoglobin: 'g/L',
  pt: 's',
  aptt: 's',
  d_dimer: 'mg/L FEU',
  cd163: 'ng/mL'
};

function canonicalUnit(unit) {
  let text = String(unit).trim().toLowerCase().replace(/ /g, '');
  text = text.replace(/×/g, '').replace(/μ/g, 'u').replace(/µ/g, 'u');
  text = text.replace(/feu/g, '');
  return text;
}

function normalizeUnit(indicator, value, unit) {
  const factors = UNIT_FACTORS[indicator];
  if (!factors) throw new Error('未知指标：' + indicator);
  const key = canonicalUnit(unit);
  if (!(key in factors)) {
    throw new Error(
      indicator + ' 不支持单位「' + unit + '」；内部单位是 ' + INTERNAL_UNITS[indicator]
    );
  }
  return Number(value) * factors[key];
}

// ---------------------------------------------------------------------------
// 数值格式：对齐 Python 的 %g / %+.3f，保证两边文字一致
// ---------------------------------------------------------------------------

function fmtG(v) {
  if (v === null || v === undefined) return '';
  const n = Number(v);
  if (!isFinite(n)) return String(n);
  if (Number.isInteger(n) && Math.abs(n) < 1e21) return String(n);
  return String(Number(n.toPrecision(6)));
}

function fmtPlusG(v) {
  const s = fmtG(v);
  return v > 0 ? '+' + s : s;
}

function fmtRound0(v) {
  return String(Math.round(v));
}

function fmtFixed1(v) {
  return Number(v).toFixed(1);
}

function fmtFixed3(v) {
  return Number(v).toFixed(3);
}

function fmtPlusFixed3(v) {
  // 注意 -0：Python 的 f"{-0.0:+.3f}" 会输出 "-0.000"，
  // 而 JS 的 (-0).toFixed(3) 会把负号吃掉，这里显式补回来，否则两边文字不一致。
  const n = Number(v);
  const sign = n > 0 || Object.is(n, 0) ? '+' : '-';
  return sign + Math.abs(n).toFixed(3);
}

// ---------------------------------------------------------------------------
// 比较
// ---------------------------------------------------------------------------

function compare(value, op, threshold) {
  if (op === '>') return value > threshold;
  if (op === '>=') return value >= threshold;
  if (op === '<') return value < threshold;
  if (op === '<=') return value <= threshold;
  if (op === '==') return value === threshold;
  throw new Error('不支持的比较符：' + op);
}

// ---------------------------------------------------------------------------
// 一次记录
// ---------------------------------------------------------------------------

function valueOf(m, indicator) {
  const v = m.indicators ? m.indicators[indicator] : undefined;
  return v === undefined || v === null ? null : Number(v);
}

function flagOf(m, key) {
  return !!(m.clinical && m.clinical[key]);
}

function maxTempC(m) {
  const t = m.clinical ? m.clinical.max_temp_c : undefined;
  return t === undefined || t === null ? null : Number(t);
}

function feverDaysOf(m) {
  const d = m.clinical ? m.clinical.fever_days : undefined;
  return d === undefined || d === null ? null : Number(d);
}

function hasFever(m, minTempC) {
  const limit = minTempC === undefined ? 38.0 : minTempC;
  if (flagOf(m, 'fever')) return true;
  const t = maxTempC(m);
  return t !== null && t >= limit;
}

function fmtObserved(indicator, value) {
  if (value === null) return '未提供';
  const spec = standards.indicators[indicator] || {};
  const label = spec.label || indicator;
  const unit = spec.unit || '';
  return label + ' ' + fmtG(value) + ' ' + unit;
}

function labelOf(indicator) {
  const spec = standards.indicators[indicator] || {};
  return spec.label || indicator;
}

function unitOf(indicator) {
  const spec = standards.indicators[indicator] || {};
  return spec.unit || '';
}

// ---------------------------------------------------------------------------
// 静态监测
// ---------------------------------------------------------------------------

const MET = 'met';
const NOT_MET = 'not_met';
const UNKNOWN = 'unknown';

function evaluatePrinto(m, suspectedSjia) {
  const spec = standards.printo_2016;
  const criteria = [];

  criteria.push({
    id: 'suspected_sjia',
    text: '确诊或疑似 sJIA',
    status: suspectedSjia ? MET : NOT_MET,
    observed: suspectedSjia ? '是' : '否'
  });

  const feverOk = hasFever(m, spec.fever_min_temp_c);
  const temp = maxTempC(m);
  criteria.push({
    id: 'fever',
    text: '出现发热',
    status: feverOk ? MET : NOT_MET,
    observed: temp !== null ? '最高体温 ' + fmtG(temp) + '℃' : (feverOk ? '有发热记录' : '无')
  });

  const mandatory = spec.mandatory;
  const mandatoryValue = valueOf(m, mandatory.indicator);
  let mandatoryOk = false;
  if (mandatoryValue === null) {
    criteria.push({ id: 'mandatory', text: mandatory.text, status: UNKNOWN, observed: '未提供' });
  } else {
    mandatoryOk = compare(mandatoryValue, mandatory.op, mandatory.value);
    criteria.push({
      id: 'mandatory',
      text: mandatory.text,
      status: mandatoryOk ? MET : NOT_MET,
      observed: fmtObserved(mandatory.indicator, mandatoryValue)
    });
  }

  let hits = 0;
  let evaluable = 0;
  spec.additional.forEach((item) => {
    const value = valueOf(m, item.indicator);
    if (value === null) {
      criteria.push({ id: item.indicator, text: item.text, status: UNKNOWN, observed: '未提供' });
      return;
    }
    evaluable += 1;
    const ok = compare(value, item.op, item.value);
    if (ok) hits += 1;
    criteria.push({
      id: item.indicator,
      text: item.text,
      status: ok ? MET : NOT_MET,
      observed: fmtObserved(item.indicator, value)
    });
  });

  const need = spec.min_additional;
  let status;
  let summary;
  if (!suspectedSjia) {
    status = 'insufficient_data';
    summary = '前提不成立：标准只适用于确诊或疑似 sJIA 的患者';
  } else if (mandatoryValue === null) {
    status = 'insufficient_data';
    summary = '缺少必备指标铁蛋白，无法判定';
  } else if (feverOk && mandatoryOk && hits >= need) {
    status = MET;
    summary = '符合：发热 + 铁蛋白达标 + 附加条目 ' + hits + '/' + need + ' 条';
  } else if (mandatoryOk && (feverOk || hits >= 1)) {
    status = 'partial';
    summary = '部分符合：铁蛋白达标，附加条目 ' + hits + '/' + need + ' 条';
  } else {
    status = NOT_MET;
    summary =
      '未达标准：铁蛋白' + (mandatoryOk ? '达标' : '未达标') + '，附加条目 ' + hits + '/' + need + ' 条';
  }

  return {
    rule_id: spec.id,
    name: spec.name,
    status: status,
    summary: summary,
    criteria: criteria,
    extra: { additional_hits: hits, additional_evaluable: evaluable, min_additional: need }
  };
}

function evalHlhCriterion(crit, m) {
  const rule = crit.rule;

  if (rule === 'fever_over_week') {
    const days = feverDaysOf(m);
    const temp = maxTempC(m);
    if (days === null || temp === null) return [UNKNOWN, '缺少体温或发热天数'];
    const ok = temp > crit.min_temp_c && days > crit.min_days;
    return [ok ? MET : NOT_MET, '最高 ' + fmtG(temp) + '℃，持续 ' + fmtG(days) + ' 天'];
  }

  if (rule === 'flag') {
    const raw = m.clinical ? m.clinical[crit.flag] : undefined;
    if (raw === undefined || raw === null) return [UNKNOWN, '未记录'];
    return [raw ? MET : NOT_MET, raw ? '有' : '无'];
  }

  if (rule === 'threshold') {
    const value = valueOf(m, crit.indicator);
    if (value === null) return [UNKNOWN, '未提供'];
    return [compare(value, crit.op, crit.value) ? MET : NOT_MET, fmtG(value)];
  }

  if (rule === 'any_of') {
    const details = [];
    let anyOk = false;
    let anyKnown = false;
    crit.conditions.forEach((cond) => {
      const value = valueOf(m, cond.indicator);
      if (value === null) {
        details.push(cond.indicator + ' 未提供');
        return;
      }
      anyKnown = true;
      if (compare(value, cond.op, cond.value)) anyOk = true;
      details.push(cond.indicator + ' ' + fmtG(value));
    });
    if (!anyKnown) return [UNKNOWN, details.join('；')];
    return [anyOk ? MET : NOT_MET, details.join('；')];
  }

  if (rule === 'cytopenia') {
    let below = 0;
    let known = 0;
    const details = [];
    crit.lineages.forEach((lin) => {
      const value = valueOf(m, lin.indicator);
      if (value === null) {
        details.push(lin.indicator + ' 未提供');
        return;
      }
      known += 1;
      const ok = compare(value, lin.op, lin.value);
      if (ok) below += 1;
      details.push(lin.indicator + ' ' + fmtG(value) + (ok ? '↓' : ''));
    });
    if (known < 2) return [UNKNOWN, '可评估的细胞系不足两条'];
    return [below >= crit.min_lineages ? MET : NOT_MET, details.join('；')];
  }

  return [UNKNOWN, '该条目暂不支持自动判定'];
}

function evaluateHlh(m) {
  const spec = standards.hlh_2004;
  const criteria = [];
  let hits = 0;
  let evaluable = 0;
  let dataMissing = 0;
  let unavailable = 0;

  spec.criteria.forEach((crit) => {
    if (crit.available === false) {
      unavailable += 1;
      criteria.push({
        id: crit.id,
        text: crit.text + '（' + (crit.reason || '本平台无法获取') + '）',
        status: UNKNOWN
      });
      return;
    }
    const res = evalHlhCriterion(crit, m);
    const status = res[0];
    if (status === UNKNOWN) {
      dataMissing += 1;
    } else {
      evaluable += 1;
      if (status === MET) hits += 1;
    }
    criteria.push({ id: crit.id, text: crit.text, status: status, observed: res[1] });
  });

  const need = spec.min_hits;
  const total = spec.criteria.length;
  let summary;
  if (hits >= need) {
    summary = '符合：' + total + ' 条中已评估 ' + evaluable + ' 条、命中 ' + hits + ' 条（需 ' + need + ' 条）';
  } else {
    const gaps = [];
    if (unavailable) gaps.push(unavailable + ' 条需要特殊检查或病理，本平台拿不到');
    if (dataMissing) gaps.push(dataMissing + ' 条因为这次没录全而无法评估');
    const tail = gaps.length ? '；另有 ' + gaps.join('，') : '';
    summary =
      '未符合：' + total + ' 条中已评估 ' + evaluable + ' 条、命中 ' + hits +
      ' 条（需 ' + need + ' 条）' + tail;
  }

  return {
    rule_id: spec.id,
    name: spec.name,
    status: hits >= need ? MET : NOT_MET,
    summary: summary,
    criteria: criteria,
    extra: {
      hits: hits,
      evaluable: evaluable,
      total: total,
      min_hits: need,
      unavailable: unavailable,
      data_missing: dataMissing
    }
  };
}

function evaluateMsScore(m) {
  const spec = standards.ms_score;
  const criteria = [];
  let total = Number(spec.intercept || 0);
  const missing = [];

  if (total) {
    criteria.push({ id: 'intercept', text: '常数项', status: MET, observed: '贡献 ' + fmtPlusFixed3(total) });
  }

  spec.terms.forEach((term) => {
    const coef = term.coefficient;
    let contribution;
    if (term.kind === 'flag') {
      const raw = m.clinical ? m.clinical[term.key] : undefined;
      if (raw === undefined || raw === null) {
        missing.push(term.text);
        criteria.push({ id: term.key, text: term.text, status: UNKNOWN, observed: '未记录' });
        return;
      }
      contribution = coef * (raw ? 1.0 : 0.0);
    } else {
      const value = valueOf(m, term.key);
      if (value === null) {
        missing.push(term.text);
        criteria.push({ id: term.key, text: term.text, status: UNKNOWN, observed: '未提供' });
        return;
      }
      contribution = coef * value;
    }
    total += contribution;
    criteria.push({
      id: term.key,
      text: term.text + ' × ' + fmtPlusG(coef),
      status: MET,
      observed: '贡献 ' + fmtPlusFixed3(contribution)
    });
  });

  const threshold = spec.threshold;
  const op = spec.threshold_op;
  if (missing.length) {
    return {
      rule_id: spec.id,
      name: spec.name,
      status: 'insufficient_data',
      summary: '缺少 ' + missing.join('、') + '，评分不完整，无法给出结论',
      criteria: criteria,
      score: null,
      threshold: threshold,
      threshold_op: op,
      extra: { missing_terms: missing }
    };
  }

  const ok = compare(total, op, threshold);
  const interceptKnown = !!spec.intercept;
  const caveat = interceptKnown
    ? ''
    : '（注：需求书未给常数项，此分数按缺常数项计算，仅作展示）';

  return {
    rule_id: spec.id,
    name: spec.name,
    status: ok ? MET : NOT_MET,
    summary: 'MS = ' + fmtFixed3(total) + '（' + op + ' ' + fmtG(threshold) + ' 提示 MAS 可能性大）' + caveat,
    criteria: criteria,
    score: total,
    threshold: threshold,
    threshold_op: op,
    extra: { note: spec.note || '', intercept_provided: interceptKnown }
  };
}

function runStatic(m, suspectedSjia) {
  return [evaluatePrinto(m, suspectedSjia), evaluateHlh(m), evaluateMsScore(m)];
}

// ---------------------------------------------------------------------------
// 动态监测
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// 适配层（本工程新增）：把一次化验报告 + 临床标志转成上面要求的 measurement
// ---------------------------------------------------------------------------

// 项目名（中文/英文别名）→ standards.indicators 的 indicator key。
// 匹配时先归一化（去空格、括号、连字符、点号、单位换算符，转小写），
// 因此 "Platelets" 与 "血小板"、"[甘油三酯]" 都能落地。
const INDICATOR_ALIASES = {
  ferritin: ['ferritin', '铁蛋白', '血清铁蛋白', 'sf'],
  platelet: ['platelet', 'platelets', 'plt', 'bpc', '血小板', '血小板计数'],
  ast: ['ast', 'got', '谷草转氨酶', '天门冬氨酸氨基转移酶', '天冬氨酸氨基转移酶', '门冬氨酸氨基转移酶'],
  alt: ['alt', 'gpt', '谷丙转氨酶', '丙氨酸氨基转移酶', '丙氨酸转氨酶'],
  ldh: ['ldh', '乳酸脱氢酶'],
  triglyceride: ['triglyceride', 'triglycerides', 'tg', '甘油三酯', '甘油三脂'],
  fibrinogen: ['fibrinogen', 'fib', 'fg', '纤维蛋白原'],
  esr: ['esr', '血沉', '红细胞沉降率', '血沉率'],
  crp: ['crp', 'c-reactiveprotein', '反应蛋白', 'c反应蛋白'],
  wbc: ['wbc', '白细胞', '白细胞计数'],
  neutrophil: ['neutrophil', 'neutrophils', 'anc', 'neu', '中性粒细胞', '中性粒细胞绝对值'],
  hemoglobin: ['hemoglobin', 'haemoglobin', 'hb', 'hgb', '血红蛋白'],
  bilirubin: ['bilirubin', 'tbil', 'tbilirubin', '总胆红素', '胆红素'],
  pt: ['pt', '凝血酶原时间'],
  aptt: ['aptt', '活化部分凝血活酶时间', '部分凝血活酶时间'],
  d_dimer: ['d-dimer', 'ddimer', 'd二聚体', '二聚体'],
  cd163: ['scd163', 'cd163', '可溶性cd163']
};

function normalizeName(text) {
  return String(text === undefined || text === null ? '' : text)
    .trim()
    .toLowerCase()
    .replace(/[\s（）()\[\]【】:：,，、;；*×·_\-—－.。'"]/g, '');
}

const ALIAS_INDEX = {};
Object.keys(INDICATOR_ALIASES).forEach((key) => {
  INDICATOR_ALIASES[key].forEach((alias) => {
    const norm = normalizeName(alias);
    if (norm && !(norm in ALIAS_INDEX)) ALIAS_INDEX[norm] = key;
  });
});

function indicatorKeyOf(name) {
  const norm = normalizeName(name);
  if (!norm) return null;
  if (ALIAS_INDEX[norm]) return ALIAS_INDEX[norm];
  let best = null;
  let bestLen = 0;
  Object.keys(ALIAS_INDEX).forEach((alias) => {
    if (alias.length >= 2 && norm.indexOf(alias) >= 0 && alias.length > bestLen) {
      best = ALIAS_INDEX[alias];
      bestLen = alias.length;
    }
  });
  return best;
}

function numericValue(value) {
  if (typeof value === 'number') return isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return null;
    // 只接受纯数值：'阴性'、'<'、'未查' 之类一律当作没有数值
    if (!/^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/.test(text)) return null;
    const n = Number(text);
    return isFinite(n) ? n : null;
  }
  return null;
}

// 一次化验报告 → measurement
function measurementFrom(report) {
  const source = report || {};
  const items = Array.isArray(source.items) ? source.items : [];
  const indicators = {};
  items.forEach((item) => {
    if (!item) return;
    const key = indicatorKeyOf(item.name);
    if (!key) return;
    const raw = numericValue(item.value);
    if (raw === null) return; // 非数值（如「阴性」）跳过
    let converted;
    try {
      converted = normalizeUnit(key, raw, item.unit);
    } catch (err) {
      return; // 单位换算失败跳过
    }
    if (converted === null || !isFinite(converted)) return;
    if (indicators[key] === undefined) indicators[key] = converted; // 同名项保留第一条
  });
  return { indicators: indicators, clinical: {} };
}

// 附加/合并临床标志（传入值优先于 m.clinical 里已有的同名值）
function withClinical(m, clinical) {
  const base = (m && m.indicators) || {};
  const indicators = {};
  Object.keys(base).forEach((key) => {
    indicators[key] = base[key];
  });
  const flags = {};
  const old = (m && m.clinical) || {};
  Object.keys(old).forEach((key) => {
    flags[key] = old[key];
  });
  const extra = clinical || {};
  Object.keys(extra).forEach((key) => {
    flags[key] = extra[key];
  });
  return { indicators: indicators, clinical: flags };
}

// 临床输入清单：从 standards.js 里实际被消费的字段反推，顺序固定。
//   1) 发热相关：PRINTO 的 fever_min_temp_c + hasFever 的 fever 标志；
//      HLH fever_over_week 的 max_temp_c / fever_days。
//   2) HLH criteria 里 rule:'flag' 的 flag（脾大）。
//   3) MS 评分表 terms 里 kind:'flag' 的 key（中枢神经系统受累、出血、关节炎）。
function clinicalFields() {
  const fields = [
    { key: 'fever', label: '发热', type: 'bool' },
    { key: 'max_temp_c', label: '最高体温(℃)', type: 'number' },
    { key: 'fever_days', label: '发热天数', type: 'number' }
  ];
  const seen = { fever: true, max_temp_c: true, fever_days: true };

  const hlh = (standards.hlh_2004 && standards.hlh_2004.criteria) || [];
  hlh.forEach((crit) => {
    if (crit.rule !== 'flag' || !crit.flag || seen[crit.flag]) return;
    seen[crit.flag] = true;
    fields.push({ key: crit.flag, label: crit.text || crit.flag, type: 'bool' });
  });

  const terms = (standards.ms_score && standards.ms_score.terms) || [];
  terms.forEach((term) => {
    if (term.kind !== 'flag' || !term.key || seen[term.key]) return;
    seen[term.key] = true;
    fields.push({ key: term.key, label: term.text || term.key, type: 'bool' });
  });

  return fields;
}

module.exports = {
  standards: standards,
  compare: compare,
  normalizeUnit: normalizeUnit,
  runStatic: runStatic,
  evaluatePrinto: evaluatePrinto,
  evaluateHlh: evaluateHlh,
  evaluateMsScore: evaluateMsScore,
  measurementFrom: measurementFrom,
  withClinical: withClinical,
  clinicalFields: clinicalFields
};
