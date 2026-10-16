const store=require('../../utils/store');
let assess=null,assessLoadError='';
try{assess=require('../../utils/assess')}catch(e){assessLoadError=(e&&e.message)||String(e)}
Page({
 data:{clinical:{},clinicalFields:[],assessResults:[],assessSource:'',assessError:'',statusLabels:{met:'符合',partial:'部分符合',not_met:'未符合',insufficient_data:'数据不足'}},
 onShow(){this.run()},
 async run(){if(!assess){this.setData({assessError:'评估模块加载失败：'+assessLoadError+'。其余功能不受影响，请把这句话截图给开发者。'});return}
  try{let s=await store.state();let clinical=store.clinical()||{};let fields=assess.clinicalFields();let latest=(s.reports||[]).slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).pop()||null;let m=assess.withClinical(assess.measurementFrom(latest||{}),clinical);this.setData({clinical:clinical,clinicalFields:fields,assessResults:assess.runStatic(m,!!clinical.suspected_sjia),assessSource:latest?latest.date:'尚无报告',assessError:''})}catch(e){this.setData({assessError:(e&&e.message)||String(e)})}},
 setSuspected(e){let c=Object.assign({},this.data.clinical);c.suspected_sjia=e.detail.value;store.saveClinical(c);this.run()},
 toggleClinical(e){let c=Object.assign({},this.data.clinical);c[e.currentTarget.dataset.key]=e.detail.value;store.saveClinical(c);this.run()},
 setClinicalNumber(e){let c=Object.assign({},this.data.clinical),k=e.currentTarget.dataset.key,v=String(e.detail.value).trim();if(v==='')delete c[k];else c[k]=Number(v);store.saveClinical(c)},
 back(){wx.navigateBack()}
})
