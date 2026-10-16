const store=require('../../utils/store');
const blank=()=>({diagnosis:'',complications:'',allergyStatus:'unknown',allergies:[],meds:[],weight:'',weightDate:'',height:'',heightDate:'',hospital:'',department:'',localHospital:'',doctorContact:'',notes:''});
const STATUS_TEXT={unknown:'尚不清楚',none:'无已知过敏',known:'有已知过敏'};
Page({
 data:{e:blank(),editing:false,statusOptions:['尚不清楚','无已知过敏','有已知过敏'],statusIndex:0,statusText:'尚不清楚'},
 onShow(){this.load()},
 load(){let raw=store.emergency()||{};let e=Object.assign(blank(),raw);e.allergies=(e.allergies||[]).slice();e.meds=(e.meds||[]).slice();if(!STATUS_TEXT[e.allergyStatus])e.allergyStatus='unknown';this.setData({e:e,statusIndex:['unknown','none','known'].indexOf(e.allergyStatus),statusText:STATUS_TEXT[e.allergyStatus]})},
 save(){store.saveEmergency(this.data.e)},
 onHide(){this.save()},
 toggleEdit(){if(this.data.editing){this.save();this.setData({editing:false})}else this.setData({editing:true})},
 field(e){this.setData({['e.'+e.currentTarget.dataset.key]:e.detail.value})},
 pickStatus(e){let i=Number(e.detail.value),keys=['unknown','none','known'];this.setData({'e.allergyStatus':keys[i],statusIndex:i,statusText:STATUS_TEXT[keys[i]]});setTimeout(()=>this.save(),0)},
 addAllergy(){this.setData({'e.allergies':this.data.e.allergies.concat([{drug:'',reaction:''}])})},
 removeAllergy(e){let a=this.data.e.allergies.slice();a.splice(e.currentTarget.dataset.index,1);this.setData({'e.allergies':a})},
 addMed(){this.setData({'e.meds':this.data.e.meds.concat([{name:'',dose:'',frequency:'',lastTaken:''}])})},
 removeMed(e){let a=this.data.e.meds.slice();a.splice(e.currentTarget.dataset.index,1);this.setData({'e.meds':a})},
 async importMeds(){try{let s=await store.state();let using=(s.medications||[]).filter(m=>!m.endDate);if(!using.length)return wx.showToast({title:'用药记录里没有「仍在用」的药',icon:'none'});let e=this.data.e,names=e.meds.map(m=>m.name),added=0;using.forEach(m=>{if(names.indexOf(m.name)<0){e.meds=e.meds.concat([{name:m.name,dose:m.dose||'',frequency:m.frequency||'',lastTaken:''}]);added++}});this.setData({e:e});wx.showToast({title:added?('已导入 '+added+' 条'):'这些药都已存在',icon:'none'})}catch(err){wx.showModal({title:'导入失败',content:err.message||String(err),showCancel:false})}},
 back(){this.save();wx.navigateBack()}
})
