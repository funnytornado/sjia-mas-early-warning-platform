// 静态监测移植验证脚本（纯 Node，不需要 wx，不使用 child_process）。
// 运行：node checks/assess.test.js
// 断言失败即抛错；全部通过则打印 PASS。

const path = require('path');

const assess = require(path.join(__dirname, '..', 'miniprogram', 'utils', 'assess.js'));

const { standards, runStatic, measurementFrom, withClinical, clinicalFields } = assess;

function report(title, items) {
  return { date: '2026-10-01', title: title, source: 'demo', items: items };
}

function item(name, value, unit, reference, flag) {
  return { name: name, value: value, unit: unit, reference: reference || '', flag: flag || '' };
}

function printoOf(m) {
  return runStatic(m, true)[0];
}

function assert(cond, message) {
  if (!cond) throw new Error('断言失败：' + message);
}

const results = [];

// 每个用例都先走 measurementFrom → withClinical，模拟真实链路。

// a) 发热 + 铁蛋白 700 + 另两条附加条目达标 → met
const rA = report('血常规+生化', [
  item('铁蛋白', '700', 'ng/mL'),
  item('血小板', '150', '10^9/L'),
  item('谷草转氨酶', '60', 'U/L'),
  item('甘油三酯', '200', 'mg/dL')
]);
const mA = withClinical(measurementFrom(rA), { fever: true, max_temp_c: 39.2 });
const pA = printoOf(mA);
results.push(['a 发热+铁蛋白700+两条附加', pA.status, pA.summary]);
assert(pA.status === 'met', 'a) 期望 met，实际 ' + pA.status + ' / ' + pA.summary);

// b) 只有铁蛋白 900、无发热、附加条目 0 条 → 不是 met
const rB = report('生化', [item('Ferritin', '900', 'ng/mL')]);
const mB = withClinical(measurementFrom(rB), {});
const pB = printoOf(mB);
results.push(['b 铁蛋白900+无发热+附加0条', pB.status, pB.summary]);
assert(pB.status !== 'met', 'b) 期望不是 met，实际 ' + pB.status);

// c) 铁蛋白 300 → 不是 met
const rC = report('生化', [item('血清铁蛋白', '300', 'ng/mL')]);
const mC = withClinical(measurementFrom(rC), { fever: true });
const pC = printoOf(mC);
results.push(['c 铁蛋白300', pC.status, pC.summary]);
assert(pC.status !== 'met', 'c) 期望不是 met，实际 ' + pC.status);

// d) 铁蛋白缺失 → insufficient_data
const rD = report('血常规', [item('血小板', '150', '10^9/L'), item('C反应蛋白', '30', 'mg/L')]);
const mD = withClinical(measurementFrom(rD), { fever: true });
const pD = printoOf(mD);
results.push(['d 铁蛋白缺失', pD.status, pD.summary]);
assert(pD.status === 'insufficient_data', 'd) 期望 insufficient_data，实际 ' + pD.status);

// e) MS 评分：各指标都正常（三个 flag 全 false）→ score ≈ -2.0（已知缺陷记录）
const mE = withClinical(
  {
    indicators: { ferritin: 150, platelet: 250, ldh: 400, fibrinogen: 400 },
    clinical: {}
  },
  { cns_involvement: false, bleeding: false, arthritis: false }
);
const msE = runStatic(mE, true)[2];
const scoreE = msE.score;
results.push(['e MS 正常值评分', String(scoreE), msE.summary]);
assert(scoreE !== null && scoreE !== undefined, 'e) MS 评分不应为 null，实际 ' + scoreE);
assert(Math.abs(scoreE - -2.0) <= 0.3, 'e) 期望 score ≈ -2.0（±0.3），实际 ' + scoreE);

// f) clinicalFields 完整结果
const fields = clinicalFields();
results.push(['f clinicalFields() 条数', String(fields.length), '']);

console.log('=== 用例结果 ===');
results.forEach((row) => {
  console.log(row[0] + ' | status/score = ' + row[1] + (row[2] ? ' | ' + row[2] : ''));
});
console.log('');
console.log('=== clinicalFields() 完整结果 ===');
console.log(JSON.stringify(fields, null, 2));
console.log('');
console.log('=== measurementFrom 抽样（用例 a）===');
console.log(JSON.stringify(mA, null, 2));
console.log('');
console.log('=== MS 评分明细（用例 e）===');
console.log('score = ' + scoreE + '（已知缺陷记录：全正常值仍算出约 -2.0）');
console.log('standards.ms_score.threshold = ' + standards.ms_score.threshold + ' ' + standards.ms_score.threshold_op);
console.log('');
console.log('PASS');
