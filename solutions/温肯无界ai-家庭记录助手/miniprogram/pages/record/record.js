const store=require('../../utils/store');
const today=()=>new Date().toISOString().slice(0,10);
const blank=()=>({name:'',value:'',unit:'',reference:'',flag:''});
const blankMed=()=>({id:null,date:today(),endDate:'',name:'',dose:'',frequency:'',note:''});
Page({
 data:{draft:{date:today(),title:'化验报告',items:[blank()]},draftMed:blankMed(),symptomDate:today(),symptomText:'',symptomId:null,busy:false,editing:''},
 onLoad(){this.takeHandoff()},
 takeHandoff(){let h=null;try{h=wx.getStorageSync('sjia-handoff')}catch(e){}
  if(!h)return;
  try{wx.removeStorageSync('sjia-handoff')}catch(e){}
  if(h.kind==='report'&&h.record)this.setData({draft:JSON.parse(JSON.stringify(h.record)),editing:'report'});
  else if(h.kind==='medication'&&h.record)this.setData({draftMed:JSON.parse(JSON.stringify(h.record)),editing:'medication'});
  else if(h.kind==='symptom'&&h.record)this.setData({symptomId:h.record.id,symptomDate:h.record.date,symptomText:h.record.text,editing:'symptom'})},
 error(e){wx.showModal({title:'操作未完成',content:e.message||String(e),showCancel:false})},
 field(e){let path=e.currentTarget.dataset.path;this.setData({[path]:e.detail.value})},
 addItem(){this.setData({'draft.items':this.data.draft.items.concat([blank()])})},
 removeItem(e){let a=this.data.draft.items.slice();a.splice(e.currentTarget.dataset.index,1);this.setData({'draft.items':a})},
 async saveReport(){let r=JSON.parse(JSON.stringify(this.data.draft));if(!r.date||!r.items.length||r.items.some(i=>!i.name.trim()||!String(i.value).trim()))return this.error(new Error('请填写采样日期、每个项目的名称和结果'));if(r.items.some((i,j)=>r.items.findIndex(x=>x.name.trim()===i.name.trim())!==j))return this.error(new Error('同一报告的项目名称不能重复'));r.items.forEach(i=>i.name=i.name.trim());try{await store.save('report',r);this.setData({draft:{date:today(),title:'化验报告',items:[blank()]},editing:''});wx.showToast({title:'已保存'})}catch(e){this.error(e)}},
 async saveSymptom(){if(!this.data.symptomText.trim())return this.error(new Error('请填写症状'));try{await store.save('symptom',{id:this.data.symptomId||undefined,date:this.data.symptomDate,text:this.data.symptomText});this.setData({symptomText:'',symptomId:null,editing:''});wx.showToast({title:'已保存'})}catch(e){this.error(e)}},
 symptomTag(e){this.setData({symptomText:(this.data.symptomText?this.data.symptomText+'；':'')+e.currentTarget.dataset.text})},
 clearMedEnd(){this.setData({'draftMed.endDate':''})},
 cancelMedEdit(){this.setData({draftMed:blankMed(),editing:''})},
 async saveMed(){let m=JSON.parse(JSON.stringify(this.data.draftMed));if(!m.date)return this.error(new Error('请选择开始日期'));if(!String(m.name).trim())return this.error(new Error('请填写药名'));if(m.endDate&&m.endDate<m.date)return this.error(new Error('结束日期不能早于开始日期'));m.name=String(m.name).trim();['dose','frequency','note'].forEach(k=>{m[k]=String(m[k]||'').trim()});try{await store.save('medication',m);this.setData({draftMed:blankMed(),editing:''});wx.showToast({title:'已保存'})}catch(e){this.error(e)}},
 async upload(){this.setData({busy:true});try{let result=await new Promise((resolve,reject)=>wx.chooseMedia({count:1,mediaType:['image'],sourceType:['album','camera'],success:resolve,fail:reject}));let file=result.tempFiles[0];if(file.size>10*1024*1024)return this.error(new Error('图片请小于10MB'));let saved=await new Promise((resolve,reject)=>wx.getFileSystemManager().saveFile({tempFilePath:file.tempFilePath,success:r=>resolve(r.savedFilePath),fail:reject}));this.setData({'draft.image':saved,'draft.source':'上传报告，待人工核对'});wx.showModal({title:'图片已附上',content:'本工具不做图片识别，图片只作为附件保存在本机。请手动填写化验项目。',showCancel:false})}catch(e){if(!String(e.errMsg||'').includes('cancel'))this.error(e)}finally{this.setData({busy:false})}},
 previewImage(){let path=this.data.draft.image;if(path)wx.previewImage({urls:[path]})},
 back(){wx.navigateBack()}
})
