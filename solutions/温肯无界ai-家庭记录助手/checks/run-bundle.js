/* 直接执行开发者工具编译出来的真实 appservice 产物，验证压缩后的包能否正常加载与运行。
   用法：node run-bundle.js <缓存文件路径> [更多缓存文件...]
   该产物格式为 define("utils/xxx.js", function(require, module, exports, ...){...}) 的连续块，
   一个完整小程序会被拆到多个缓存分片里，所以支持一次传多个。 */
const fs = require('fs');
const BUNDLES = process.argv.slice(2);
let src = '';
BUNDLES.forEach(p => { src += '\n' + fs.readFileSync(p, 'utf8'); });

const mods = {};
global.define = function (p, fn) { mods[p] = fn; };
const persisted = {};
global.wx = {
  getStorageSync: k => persisted[k],
  setStorageSync: (k, v) => { persisted[k] = v; },
  removeStorageSync: k => { delete persisted[k]; },
  createCanvasContext: () => ({ setFillStyle() {}, fillRect() {}, setStrokeStyle() {}, setLineWidth() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, arc() {}, fill() {}, setFontSize() {}, fillText() {}, draw() {} }),
  getWindowInfo: () => ({ windowWidth: 375 }),
  nextTick: f => f(),
  showModal() {}, showToast() {}, setClipboardData() {},
  getFileSystemManager: () => ({}),
  env: { USER_DATA_PATH: '/tmp' }
};
let captured = null;
global.Page = function (o) { captured = o; };
global.App = function () {};
global.getApp = () => ({});
global.Component = function () {};
global.Behavior = function () {};
global.loadBabelMod = function () {};

let parseErr = null;
try { (0, eval)(src); } catch (e) { parseErr = e; }
console.log('产物解析: ' + (parseErr ? '失败 -> ' + parseErr.message : '成功'));
console.log('注册模块数: ' + Object.keys(mods).length);
console.log('模块列表: ' + Object.keys(mods).join(', '));

function resolvePath(from, spec) {
  if (spec[0] !== '.') return spec;
  const parts = from.split('/'); parts.pop();
  spec.split('/').forEach(s => { if (s === '.' || s === '') return; if (s === '..') parts.pop(); else parts.push(s); });
  return parts.join('/');
}
const cache = {};
/* SWC 运行时助手：编译器会把展开/解构/async 转成对这些模块的 require，真机由平台自带。 */
const SWC = {
  _sliced_to_array: a => Array.from(a || []),
  _to_consumable_array: a => Array.from(a || []),
  _object_spread: (...a) => Object.assign({}, ...a),
  _object_spread_props: (t, p) => Object.assign(t, p),
  _ts_generator: (t, f) => f,
  _define_property: (obj, key, value) => { obj[key] = value; return obj; },
  _async_to_generator: fn => function () {
    const self = this, args = arguments;
    return new Promise((resolve, reject) => {
      const g = fn.apply(self, args);
      function step(k, v) {
        let r;
        try { r = g[k](v); } catch (e) { return reject(e); }
        if (r.done) return resolve(r.value);
        Promise.resolve(r.value).then(x => step('next', x), e => step('throw', e));
      }
      step('next');
    });
  },
  _async_to_generator2: function () { return this; }
};
function swcHelper(name) {
  let h = SWC[name];
  if (!h) {
    console.log('   [警告] 未实现的 SWC 助手：' + name + '，用恒等函数顶替');
    h = function (x) { return x; };
  }
  if (typeof h === 'function') { if (!h._) h._ = h; if (!h.default) h.default = h; }
  return h;
}
function load(path) {
  if (cache[path]) return cache[path];
  let key = path;
  if (!/\.js$/.test(key)) key += '.js';
  if (key.indexOf('@swc/runtime/') === 0) return swcHelper(key.replace('@swc/runtime/', '').replace('.js', ''));
  const fn = mods[key];
  if (!fn) throw new Error('模块不存在: ' + key);
  const module = { exports: {} };
  const req = spec => load(resolvePath(key, spec));
  fn(req, module, module.exports);
  cache[path] = module.exports;
  return module.exports;
}

function step(name, fn) {
  try { const r = fn(); console.log('OK   ' + name + (r === undefined ? '' : ' -> ' + r)); return r; }
  catch (e) { console.log('FAIL ' + name + ' -> ' + e.message); console.log(e.stack); return null; }
}

const assess = step('加载 utils/assess（压缩后）', () => load('utils/assess.js'));
if (assess) {
  step('clinicalFields 条数', () => assess.clinicalFields().length);
  step('三套标准跑一遍', () => {
    const m = assess.withClinical(assess.measurementFrom({ items: [{ name: '铁蛋白', value: '700', unit: 'ng/mL' }, { name: '血小板', value: '150', unit: '10^9/L' }, { name: '甘油三酯', value: '200', unit: 'mg/dL' }] }), { fever: true });
    return assess.runStatic(m, true).map(r => r.rule_id + '=' + r.status).join(' ');
  });
}
const engine = step('加载 utils/engine（压缩后）', () => load('utils/engine.js'));
if (engine) {
  step('dateRange 2月末', () => JSON.stringify(engine.dateRange('2026', '2', '全部')));
  step('medicationsIn 仍在用的药', () => JSON.stringify(engine.medicationsIn([{ id: 'a', date: '2026-09-07', endDate: '', name: '甲氨蝶呤' }], engine.dateRange('2026', '9', '11')).map(m => m.name)));
}
step('加载 utils/store', () => { load('utils/store.js'); return 'ok'; });
const pageObjs = {};
step('加载 pages/home/home.js（压缩后）', () => { captured = null; load('pages/home/home.js'); if (captured) pageObjs['pages/home/home.js'] = captured; return captured ? 'Page 已注册' : '未捕获 Page'; });
Object.keys(mods).filter(k=>k.indexOf('pages/')===0).forEach(k=>step('加载 '+k+'（压缩后）',()=>{captured=null;load(k);if(captured)pageObjs[k]=captured;return 'ok';}));

const homePage = pageObjs['pages/home/home.js'];
if (homePage) {
  const ctx = {};
  Object.assign(ctx, homePage);
  ctx.data = JSON.parse(JSON.stringify(homePage.data));
  ctx.setData = function (d) { Object.assign(this.data, d); };
  step('跑 onShow 生命周期', () => { homePage.onShow.call(ctx); return 'ok'; });
  setTimeout(() => {
    try {
      console.log('--- 运行结果（压缩包）---');
      console.log('  默认 tab = ' + ctx.data.tab);
      console.log('  metricNames = ' + JSON.stringify(ctx.data.metricNames));
      console.log('  clinicalFields = ' + (ctx.data.clinicalFields || []).length);
      console.log('  assessResults = ' + (ctx.data.assessResults || []).length);
      console.log('  yearOptions = ' + JSON.stringify(ctx.data.yearOptions));
      console.log('  dayRangeLabel = ' + ctx.data.dayRangeLabel);
      console.log('  assessError = ' + (ctx.data.assessError || '(空)'));
      console.log('  子栏目切换:');
      ['record', 'history', 'trends', 'query'].forEach(t => {
        try { homePage.switchTab.call(ctx, { currentTarget: { dataset: { tab: t } } }); console.log('    ' + t + ' OK'); }
        catch (e) { console.log('    ' + t + ' 失败 -> ' + e.message); }
      });
      console.log('=== 压缩产物验证结束 ===');
    } catch (e) {
      console.log('结果读取失败: ' + e.message);
    }
    process.exit(0);
  }, 600);
}
