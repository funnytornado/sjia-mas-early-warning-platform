/* 自检用的固定测试数据（放在 checks/ 下，不会打进小程序包） */
const names=['铁蛋白','血小板','AST','甘油三酯','纤维蛋白原','CRP'],units=['ng/mL','10^9/L','U/L','mg/dL','mg/dL','mg/L'];
const values=[[200,350,25,100,450,10],[350,320,30,120,420,20],[600,280,40,140,380,40],[900,220,55,170,340,70],[1400,160,75,200,300,110],[2100,120,95,230,260,160]];
const medPlan=[
 {name:'泼尼松',dose:'15 mg',frequency:'每日两次',endDate:'2026-09-05',note:'晨起顿服；按医嘱减量'},
 {name:'布洛芬',dose:'200 mg',frequency:'每日三次',endDate:'2026-09-09',note:'发热时按医嘱使用'},
 {name:'泼尼松',dose:'10 mg',frequency:'每日两次',endDate:'2026-09-09',note:'减量阶段'},
 {name:'甲氨蝶呤',dose:'7.5 mg',frequency:'每周一次',endDate:'',note:'每周固定一天服用，同时补叶酸'},
 {name:'泼尼松',dose:'5 mg',frequency:'每日一次',endDate:'',note:'维持剂量'},
 {name:'叶酸',dose:'5 mg',frequency:'每周一次',endDate:'',note:'服甲氨蝶呤后一天服用'}
];
function trajectory(){return values.map((v,i)=>({id:'sample-'+i,date:'2026-09-'+String(1+i*2).padStart(2,'0'),title:'测试化验报告 '+(i+1),source:'测试数据',items:v.map((n,j)=>({name:names[j],value:String(n),unit:units[j],reference:'',flag:''}))}))}
function medications(){return medPlan.map((m,i)=>({id:'med-'+i,date:'2026-09-'+String(1+i*2).padStart(2,'0'),endDate:m.endDate,name:m.name,dose:m.dose,frequency:m.frequency,note:m.note,source:'测试数据'}))}
function eb(){return{title:'EB 病毒抗体报告（测试）',date:'2026-09-13',source:'测试数据',items:[{name:'EB病毒早期抗原抗体IgM',value:'0.64',unit:'COI',reference:'<1.1',flag:''},{name:'EB病毒核心抗原抗体IgG',value:'433.80',unit:'U/mL',reference:'<20',flag:'偏高'},{name:'EB病毒衣壳抗原抗体IgG',value:'482.80',unit:'U/mL',reference:'<20',flag:'偏高'},{name:'EB病毒衣壳抗原抗体IgM',value:'2.49',unit:'U/mL',reference:'<40',flag:''},{name:'EB病毒早期抗原抗体IgG',value:'阴性',unit:'',reference:'阴性',flag:''}]}}
module.exports={trajectory,medications,eb}
