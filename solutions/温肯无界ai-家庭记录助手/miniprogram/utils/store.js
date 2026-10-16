const engine=require('./engine');const KEY='sjia-records-v1';const CKEY='sjia-clinical-v1';const PKEY='sjia-profile-v1';const EKEY='sjia-emergency-v1';
const KINDS={report:'reports',symptom:'symptoms',medication:'medications'};
function local(){let s=wx.getStorageSync(KEY)||{};return{reports:s.reports||[],symptoms:s.symptoms||[],medications:s.medications||[]}}
async function state(){let s=local();s.missing=engine.missing(s.reports);s.latestDate=(engine.latestOf(s.reports)||{}).date||'';return s}
async function save(kind,record){let key=KINDS[kind];if(!key)throw new Error('记录类型无效');record.id=record.id||Date.now()+'-'+Math.random().toString(36).slice(2,7);let s=local();s[key]=s[key].filter(r=>r.id!==record.id).concat([record]);wx.setStorageSync(KEY,s)}
async function remove(id){let s=local();Object.keys(KINDS).forEach(k=>{let key=KINDS[k];s[key]=s[key].filter(r=>r.id!==id)});wx.setStorageSync(KEY,s)}
async function reset(){wx.removeStorageSync(KEY);wx.removeStorageSync(CKEY);wx.removeStorageSync(PKEY);wx.removeStorageSync(EKEY)}
async function summary(start,end){let s=local();return engine.summary(s.reports,s.symptoms,s.medications,start,end)}
function clinical(){return wx.getStorageSync(CKEY)||{}}
function saveClinical(c){wx.setStorageSync(CKEY,c||{})}
function profile(){return wx.getStorageSync(PKEY)||{}}
function saveProfile(p){wx.setStorageSync(PKEY,p||{})}
function emergency(){return wx.getStorageSync(EKEY)||{}}
function saveEmergency(e){wx.setStorageSync(EKEY,e||{})}
module.exports={state,save,remove,reset,summary,clinical,saveClinical,profile,saveProfile,emergency,saveEmergency}
