/* 只做记录与整理：不含风险分级、不含阈值判断 */
const indicators={ferritin:['铁蛋白','ng/mL'],platelets:['血小板','10^9/L'],ast:['AST','U/L'],triglycerides:['甘油三酯','mg/dL'],fibrinogen:['纤维蛋白原','mg/dL']}
const aliases={'铁蛋白':'ferritin','血小板':'platelets','AST':'ast','谷草转氨酶':'ast','天门冬氨酸氨基转移酶':'ast','甘油三酯':'triglycerides','纤维蛋白原':'fibrinogen','CRP':'crp','C反应蛋白':'crp'}
const allowed={ferritin:['ng/ml','ug/l'],platelets:['10^9/l','109/l'],ast:['u/l','iu/l'],triglycerides:['mg/dl','mmol/l'],fibrinogen:['mg/dl','g/l'],crp:['mg/l']}
function normalize(i){let k=aliases[i.name]||i.name;let n=Number(i.value);let u=(i.unit||'').replace(/\s|×|x/g,'').replace(/μ/g,'u').toLowerCase();if(String(i.value).trim()===''||!Number.isFinite(n)||n<0||!(allowed[k]||[]).includes(u))return[k,null];if(k==='triglycerides'&&u==='mmol/l')n*=88.57;if(k==='fibrinogen'&&u==='g/l')n*=100;return[k,n]}
function sorted(reports){return (reports||[]).slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)))}
function latestOf(reports){let rs=sorted(reports);return rs[rs.length-1]}
function missing(reports){let l=latestOf(reports),vals={};if(l)l.items.forEach(i=>{let[k,v]=normalize(i);vals[k]=v});return Object.keys(indicators).filter(k=>vals[k]==null).map(k=>indicators[k][0])}
function metricOptions(reports){const common=Object.keys(indicators).map(k=>indicators[k][0]);const extra=[];(reports||[]).forEach(r=>(r.items||[]).forEach(i=>{if(i.name&&common.indexOf(i.name)<0&&extra.indexOf(i.name)<0)extra.push(i.name)}));return common.concat(extra)}
function summary(rs,ss,ms,start,end){end=end||'9999-12-31';
 let chosen=sorted(rs).filter(r=>(!start||r.date>=start)&&r.date<=end);
 let meds=(ms||[]).filter(m=>{let from=m.date||'',to=m.endDate||'9999-12-31';return from<=end&&(!start||to>=start)}).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
 let syms=sorted(ss).filter(s=>(!start||s.date>=start)&&s.date<=end);
 let miss=missing(chosen);
 let lines=['家庭记录助手 · 就诊摘要',`记录范围：${start||'全部'} 至 ${end}`,`报告 ${chosen.length} 份 ｜ 用药 ${meds.length} 条 ｜ 症状 ${syms.length} 条`,'','症状记录：'];
 if(!syms.length)lines.push('（本时间段内无症状记录）');
 syms.forEach(s=>lines.push(`${s.date}：${s.text}`));
 lines.push('','用药记录：');
 if(!meds.length)lines.push('（本时间段内无用药记录）');
 meds.forEach(m=>{let span=m.endDate?`${m.date} 至 ${m.endDate}`:`${m.date} 起（未记录结束）`;let extra=[m.dose,m.frequency].filter(x=>x&&String(x).trim()).join(' · ');lines.push(`${span}｜${m.name}${extra?'｜'+extra:''}${m.note&&String(m.note).trim()?'｜备注：'+m.note:''}`)});
 lines.push('','化验记录：');
 if(!chosen.length)lines.push('（本时间段内无化验报告）');
 chosen.forEach(r=>{lines.push(`[${r.date}] ${r.title} / 来源：${r.source||'手动'}`);r.items.forEach(i=>lines.push(`  ${i.name}：${i.value} ${i.unit||''}；参考：${i.reference||'未提供'}；报告标记：${i.flag||'未标记'}`))});
 lines.push('','最近一份报告未包含的项目：'+(miss.join('、')||'五种常用指标都有'));
 lines.push('','本摘要由本人录入的内容整理生成，仅作就诊时沟通参考，不构成诊断或治疗建议。');
 return lines.join('\n')}
function pad2(n){return String(n).padStart(2,'0')}
function dateRange(year,month,day){if(!year)return null;const y=String(year);const hasM=!(month===undefined||month===null||month===''||month==='全部');if(!hasM)return{start:y+'-01-01',end:y+'-12-31',label:y+' 年'};const m=Number(month);const last=new Date(Number(y),m,0).getDate();if(day===undefined||day===null||day===''||day==='全部')return{start:y+'-'+pad2(m)+'-01',end:y+'-'+pad2(m)+'-'+pad2(last),label:y+' 年 '+m+' 月'};const d=Math.min(Number(day),last);return{start:y+'-'+pad2(m)+'-'+pad2(d),end:y+'-'+pad2(m)+'-'+pad2(d),label:y+'-'+pad2(m)+'-'+pad2(d)}}
function ageFrom(birth,today){if(!birth)return '';const b=String(birth).split('-');if(b.length<3)return '';const t=(today?String(today):new Date().toISOString().slice(0,10)).split('-');if(Number(b[0])<1900)return '';let y=Number(t[0])-Number(b[0]),m=Number(t[1])-Number(b[1]);if(Number(t[2])<Number(b[2]))m--;if(m<0){y--;m+=12}if(y<0)return '';if(y===0)return m+' 个月';return m?y+' 岁 '+m+' 个月':y+' 岁'}
function symptomsIn(list,range){if(!range)return [];return (list||[]).filter(s=>s.date>=range.start&&s.date<=range.end).sort((a,b)=>String(a.date).localeCompare(String(b.date)))}
function medicationsIn(list,range){if(!range)return [];return (list||[]).filter(m=>{const from=m.date||'';const to=m.endDate||'9999-12-31';return from<=range.end&&to>=range.start}).sort((a,b)=>String(a.date).localeCompare(String(b.date)))}
module.exports={normalize,missing,latestOf,metricOptions,summary,indicators,dateRange,symptomsIn,medicationsIn,ageFrom}
