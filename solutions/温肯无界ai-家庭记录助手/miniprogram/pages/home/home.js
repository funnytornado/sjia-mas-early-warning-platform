const store=require('../../utils/store'),engine=require('../../utils/engine'),docx=require('../../utils/docx'),seed=require('../../utils/seed');
const today=()=>new Date().toISOString().slice(0,10);
const stamp=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())};
Page({
 data:{tab:'record',reports:[],symptoms:[],medications:[],missingNames:'',latestDate:'',summaryText:'',start:'',end:today(),selectedMetric:'铁蛋白',metricNames:[],points:[],detail:null,lastError:'',sosOpen:false,sosBig:true,sosEmergency:{},sosProfile:{},sosStatusText:'',fYear:'',fMonth:'全部',fDay:'全部',yearOptions:[],monthOptions:['全部','1','2','3','4','5','6','7','8','9','10','11','12'],dayOptions:['全部','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'],dayRangeLabel:'',daySymptoms:[],dayMedications:[]},
 onShow(){this.setData({lastError:wx.getStorageSync('sjia-last-error')||''});this.refresh()},
 async refresh(){try{let s=await store.state();s.reports.sort((a,b)=>b.date.localeCompare(a.date));s.symptoms.sort((a,b)=>b.date.localeCompare(a.date));s.medications.sort((a,b)=>b.date.localeCompare(a.date));let opts=engine.metricOptions(s.reports);let sel=opts.indexOf(this.data.selectedMetric)>=0?this.data.selectedMetric:opts[0];this.setData({...s,missingNames:(s.missing||[]).join('、'),metricNames:opts,selectedMetric:sel,yearOptions:this.buildYears(s)});if(!this.data.fYear)this.setData({fYear:String(new Date().getFullYear())});this.updatePoints();this.applyDayFilter();if(this.data.summaryText)this.makeSummary()}catch(e){this.error(e)}},
 error(e){wx.showModal({title:'操作未完成',content:e.message||String(e),showCancel:false})},
 switchTab(e){this.setData({tab:e.currentTarget.dataset.tab});if(this.data.tab==='trends')this.updatePoints();if(this.data.tab==='query')this.applyDayFilter()},
 goRecord(){wx.navigateTo({url:'/pages/record/record'})},
 goAssess(){wx.navigateTo({url:'/pages/assess/assess'})},
 field(e){let path=e.currentTarget.dataset.path;this.setData({[path]:e.detail.value})},
 editMed(e){let m=this.data.medications.find(x=>x.id===e.currentTarget.dataset.id);if(!m)return;try{wx.setStorageSync('sjia-handoff',{kind:'medication',record:m})}catch(err){}wx.navigateTo({url:'/pages/record/record'})},
 seedDemo(){const s=seed.build();const run=async()=>{for(const r of s.reports)await store.save('report',r);for(const x of s.symptoms)await store.save('symptom',x);for(const m of s.medications)await store.save('medication',m);store.saveClinical(s.clinical);await this.refresh();wx.showToast({title:'已加入模拟数据'})};run().catch(e=>this.error(e));},
 resetAll(){wx.showModal({title:'清空本机全部记录？',content:'将删除本机上的全部化验报告、症状和用药记录（含模拟数据），以及已填的临床项，且不可恢复。',success:async r=>{if(r.confirm){try{await store.reset();this.setData({detail:null,summaryText:''});await this.refresh()}catch(e){this.error(e)}}}})},
 async openDetail(e){let s=await store.state(),id=e.currentTarget.dataset.id;this.setData({detail:s.reports.find(r=>r.id===id),tab:'history'})},
 editReport(){if(!this.data.detail)return;try{wx.setStorageSync('sjia-handoff',{kind:'report',record:this.data.detail})}catch(e){}this.setData({detail:null});wx.navigateTo({url:'/pages/record/record'})},
 closeDetail(){this.setData({detail:null})},
 deleteRecord(e){let id=e.currentTarget.dataset.id;wx.showModal({title:'删除这条记录？',success:async r=>{if(r.confirm){try{await store.remove(id);this.setData({detail:null});await this.refresh()}catch(e){this.error(e)}}}})},
 previewImage(){let path=this.data.detail&&this.data.detail.image;if(path)wx.previewImage({urls:[path]})},
 chooseMetric(e){this.setData({selectedMetric:this.data.metricNames[Number(e.detail.value)]});this.updatePoints()},
 updatePoints(){let name=this.data.selectedMetric,points=this.data.reports.slice().sort((a,b)=>a.date.localeCompare(b.date)).flatMap(r=>r.items.filter(i=>i.name===name).map(i=>({date:r.date,value:i.value,unit:i.unit,flag:i.flag,reference:i.reference,reportId:r.id})));this.setData({points});if(this.data.tab==='trends')wx.nextTick(()=>this.drawChart())},
 drawChart(){let ps=this.data.points;let numeric=ps.filter(p=>String(p.value).trim()!==''&&Number.isFinite(Number(p.value)));let units=[...new Set(numeric.map(p=>p.unit))];let can=numeric.length>=2&&units.length===1;
 let note;
 if(!ps.length)note='「'+this.data.selectedMetric+'」暂时没有记录。先录一份含这个项目的报告，或点上面的其它指标切换。';
 else if(can)note='按采样日期绘制；原始单位：'+units[0];
 else note='这个指标有 '+ps.length+' 条记录，但至少需要两次数值结果且单位一致才能连线；文字结果和混合单位请看下方列表。';
 this.setData({chartNote:note});
 let ctx=wx.createCanvasContext('trend',this),width=wx.getWindowInfo().windowWidth-56-28*2,h=210;ctx.setFillStyle('#ffffff');ctx.fillRect(0,0,width,h);if(can){let vs=numeric.map(p=>Number(p.value)),min=Math.min(...vs),max=Math.max(...vs),span=max-min||1,dates=numeric.map(p=>Date.parse(p.date)),tmin=Math.min(...dates),tspan=Math.max(...dates)-tmin||1;ctx.setStrokeStyle('#0b8b83');ctx.setLineWidth(3);ctx.beginPath();numeric.forEach((p,i)=>{let x=20+(dates[i]-tmin)/tspan*(width-45),y=170-(vs[i]-min)/span*130;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();numeric.forEach((p,i)=>{let x=20+(dates[i]-tmin)/tspan*(width-45),y=170-(vs[i]-min)/span*130;ctx.setFillStyle('#0b8b83');ctx.beginPath();ctx.arc(x,y,4,0,2*Math.PI);ctx.fill();ctx.setFontSize(11);ctx.fillText(String(p.value),Math.min(x,width-40),y-12)});ctx.setFillStyle('#71827d');ctx.fillText(numeric[0].date,12,200);ctx.fillText(numeric[numeric.length-1].date,width-85,200)}ctx.draw()},
 async makeSummary(){if(this.data.start&&this.data.start>this.data.end)return this.error(new Error('开始日期不能晚于结束日期'));try{this.setData({summaryText:await store.summary(this.data.start,this.data.end)})}catch(e){this.error(e)}},
 docxFile(kind){if(kind==='report'){if(!this.data.detail)throw new Error('请先打开一份报告');return{bytes:docx.reportDocx(this.data.detail),name:'化验报告-'+this.data.detail.date+'.docx'}}return{bytes:docx.summaryDocx({reports:this.data.reports,symptoms:this.data.symptoms,medications:this.data.medications,missing:this.data.missingNames?this.data.missingNames.split('、'):[],start:this.data.start,end:this.data.end}),name:'家庭记录助手-就诊摘要-'+stamp()+'.docx'}},
 writeDocx(kind){let f=this.docxFile(kind),path=wx.env.USER_DATA_PATH+'/'+f.name,fs=wx.getFileSystemManager();if(fs.writeFileSync)fs.writeFileSync(path,f.bytes.buffer,'binary');return{path,name:f.name}},
 previewWord(e){try{let f=this.writeDocx(e.currentTarget.dataset.kind);wx.openDocument({filePath:f.path,fileType:'docx',showMenu:true,fail:err=>this.error(new Error((err&&err.errMsg)||'打开文档失败'))});if(!this.data.summaryText)this.makeSummary()}catch(err){this.error(err)}},
 shareWord(e){try{let f=this.writeDocx(e.currentTarget.dataset.kind);wx.shareFileMessage({filePath:f.path,fileName:f.name,fail:err=>this.error(new Error((err&&err.errMsg)||'分享失败，可改用「预览 Word」再转发'))})}catch(err){this.error(err)}},
 copySummary(){wx.setClipboardData({data:this.data.summaryText})},buildYears(s){const now=String(new Date().getFullYear());const set={};set[now]=1;['reports','symptoms','medications'].forEach(k=>{(s[k]||[]).forEach(r=>{if(r.date)set[String(r.date).slice(0,4)]=1})});return Object.keys(set).sort((a,b)=>b.localeCompare(a))},
pickFilter(e){const f=e.currentTarget.dataset.field,v=e.detail.value;if(f==='fYear')this.setData({fYear:this.data.yearOptions[Number(v)]});else if(f==='fMonth')this.setData({fMonth:this.data.monthOptions[Number(v)]});else this.setData({fDay:this.data.dayOptions[Number(v)]});this.applyDayFilter()},
applyDayFilter(){const r=engine.dateRange(this.data.fYear,this.data.fMonth,this.data.fDay);if(!r){this.setData({dayRangeLabel:'',daySymptoms:[],dayMedications:[]});return}this.setData({dayRangeLabel:r.label,daySymptoms:engine.symptomsIn(this.data.symptoms,r),dayMedications:engine.medicationsIn(this.data.medications,r)})},
resetDayFilter(){this.setData({fYear:String(new Date().getFullYear()),fMonth:'全部',fDay:'全部'});this.applyDayFilter()},
 openSos(){const s=store.emergency()||{},p=store.profile()||{},m={'none':'无已知过敏','unknown':'尚不清楚','known':'有已知过敏'};this.setData({sosOpen:true,sosBig:true,sosEmergency:s,sosProfile:p,sosStatusText:m[s.allergyStatus]||'尚不清楚（未确认）'});},
 closeSos(){this.setData({sosOpen:false});},
 toggleSosBig(){this.setData({sosBig:!this.data.sosBig});},
 editEmergency(){this.setData({sosOpen:false});wx.navigateTo({url:'/pages/emergency/emergency'});},
 callNumber(num,who){if(!num)return wx.showModal({title:'没有可拨打的号码',content:'请先在「个人」页填写'+who+'的联系电话。',showCancel:false});wx.showModal({title:'确认拨号',content:'即将拨打 '+who+'：'+num+'。不会自动呼叫，需要你确认。',confirmText:'拨打',success:r=>{if(!r.confirm)return;wx.makePhoneCall({phoneNumber:String(num),fail:err=>{const em=String((err&&err.errMsg)||err);if(em.indexOf('cancel')<0)wx.showModal({title:'未拨出',content:em,showCancel:false})}})}});},
 callMain(){this.callNumber(this.data.sosProfile.emgPhone,'主紧急联系人');},
 callBackup(){this.callNumber(this.data.sosProfile.emg2Phone,'备用紧急联系人');},
 call120(){this.callNumber('120','急救电话 120');},
 clearLastError(){try{wx.removeStorageSync('sjia-last-error')}catch(e){}this.setData({lastError:''})}
})
