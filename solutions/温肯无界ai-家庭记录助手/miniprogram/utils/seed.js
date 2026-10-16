/* 演示用模拟数据：只在用户主动点「加入模拟数据」时写入。
   每条都用固定 id（seed-*），所以重复点击是覆盖而不是翻倍，也不会碰到用户自己的记录；
   这些记录与真实记录存在同一处，因此「清空本机全部记录」能把它们一并清掉。 */
const TAG='模拟数据';
function day(offset){const t=new Date();t.setDate(t.getDate()+offset);const p=n=>String(n).padStart(2,'0');return t.getFullYear()+'-'+p(t.getMonth()+1)+'-'+p(t.getDate())}
const ITEMS=[['铁蛋白','ng/mL'],['血小板','10^9/L'],['AST','U/L'],['甘油三酯','mg/dL'],['纤维蛋白原','mg/dL'],['乳酸脱氢酶','U/L'],['CRP','mg/L']];
const SERIES=[
 {d:-56,v:['310','268','32','120','320','300','5.2']},
 {d:-28,v:['420','255','41','150','300','360','12']},
 {d:-7,v:['860','205','55','180','265','480','38']},
 {d:-2,v:['1780','158','78','210','230','620','72']}
];
function build(){return{
 reports:SERIES.map((s,i)=>({id:'seed-report-'+(i+1),date:day(s.d),title:'化验报告（模拟数据）',source:TAG,items:ITEMS.map((k,j)=>({name:k[0],value:s.v[j],unit:k[1],reference:'',flag:''}))})),
 symptoms:[
  {id:'seed-sym-1',date:day(-2),text:'（模拟数据）晚间发热，最高 38.6℃，精神一般'},
  {id:'seed-sym-2',date:day(-7),text:'（模拟数据）双膝疼痛，走路略跛'},
  {id:'seed-sym-3',date:day(-28),text:'（模拟数据）食欲下降，躯干皮疹'}
 ],
 medications:[
  {id:'seed-med-1',date:day(-56),endDate:day(-28),name:'泼尼松',dose:'15 mg',frequency:'每日两次',note:'模拟数据：晨起顿服',source:TAG},
  {id:'seed-med-2',date:day(-28),endDate:day(-7),name:'泼尼松',dose:'10 mg',frequency:'每日两次',note:'模拟数据：减量阶段',source:TAG},
  {id:'seed-med-3',date:day(-42),endDate:'',name:'甲氨蝶呤',dose:'7.5 mg',frequency:'每周一次',note:'模拟数据：每周固定一天，同时补叶酸',source:TAG},
  {id:'seed-med-4',date:day(-2),endDate:'',name:'布洛芬',dose:'200 mg',frequency:'发热时用',note:'模拟数据',source:TAG}
 ],
 clinical:{suspected_sjia:true,fever:true,max_temp_c:39.0,fever_days:3,cns_involvement:false,bleeding:false,arthritis:true,splenomegaly:false}
}}
module.exports={build,TAG}
