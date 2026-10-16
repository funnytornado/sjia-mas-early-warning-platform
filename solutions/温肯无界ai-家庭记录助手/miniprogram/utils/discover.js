const DEMO='演示数据，非真实来源';
const PAGE_NOTE='本页是形态演示：以下全部内容是写死的样例数据，不是真实医院，也不是真实政策文件；本页不提供诊疗建议，也不提供预约挂号服务。真实上线必须接入权威数据源，并标明来源与发布日期。';
const cities=['全部','北京','上海','杭州','温州','广州','成都'];
const departments=['全部','风湿免疫科','儿科','眼科','康复科'];
const hospitals=[
 {id:'h1',name:'示例医院（北京）',city:'北京',level:'三级甲等',departments:['风湿免疫科','儿科','眼科'],address:'演示地址：北京市示例区示例路 1 号',officialSite:'演示：未提供真实链接',appointment:'演示：不提供预约入口',note:DEMO},
 {id:'h2',name:'示例医院（上海）',city:'上海',level:'三级甲等',departments:['风湿免疫科','儿科'],address:'演示地址：上海市示例区示例路 2 号',officialSite:'演示：未提供真实链接',appointment:'演示：不提供预约入口',note:DEMO},
 {id:'h3',name:'示例医院（杭州）',city:'杭州',level:'三级甲等',departments:['风湿免疫科','康复科'],address:'演示地址：杭州市示例区示例路 3 号',officialSite:'演示：未提供真实链接',appointment:'演示：不提供预约入口',note:DEMO},
 {id:'h4',name:'示例医院（温州）',city:'温州',level:'三级甲等',departments:['儿科','风湿免疫科'],address:'演示地址：温州市示例区示例路 4 号',officialSite:'演示：未提供真实链接',appointment:'演示：不提供预约入口',note:DEMO},
 {id:'h5',name:'示例医院（广州）',city:'广州',level:'三级甲等',departments:['风湿免疫科','眼科'],address:'演示地址：广州市示例区示例路 5 号',officialSite:'演示：未提供真实链接',appointment:'演示：不提供预约入口',note:DEMO},
 {id:'h6',name:'示例医院（成都）',city:'成都',level:'三级甲等',departments:['儿科','康复科'],address:'演示地址：成都市示例区示例路 6 号',officialSite:'演示：未提供真实链接',appointment:'演示：不提供预约入口',note:DEMO}
];
const regions=['全部','全国','浙江','上海','北京'];
const policies=[
 {id:'g1',region:'全国',title:'示例：门诊慢特病跨省直接结算说明',publishedAt:'2026-08-01',sourceName:'演示来源（非真实文件）',
  summary:'演示摘要：本应写明备案方式、选定点医院、结算流程与不予支付的情形。此处为占位文字。',tags:['医保','异地就医'],note:DEMO},
 {id:'g2',region:'浙江',title:'示例：城乡居民大病保险报销比例说明',publishedAt:'2026-07-15',sourceName:'演示来源（非真实文件）',
  summary:'演示摘要：本应写明起付线、报销比例与封顶线的口径。此处为占位文字。',tags:['医保','大病保险'],note:DEMO},
 {id:'g3',region:'上海',title:'示例：少儿住院互助基金参加办法',publishedAt:'2026-07-02',sourceName:'演示来源（非真实文件）',
  summary:'演示摘要：本应写明参保对象、缴费时间与报销范围。此处为占位文字。',tags:['少儿','住院'],note:DEMO},
 {id:'g4',region:'北京',title:'示例：门诊特殊病备案办理指引',publishedAt:'2026-06-20',sourceName:'演示来源（非真实文件）',
  summary:'演示摘要：本应写明所需材料、办理地点与时限。此处为占位文字。',tags:['备案','门诊'],note:DEMO},
 {id:'g5',region:'全国',title:'示例：罕见病医疗救助申请入口说明',publishedAt:'2026-05-30',sourceName:'演示来源（非真实文件）',
  summary:'演示摘要：本应写明救助对象、申请材料与受理部门。此处为占位文字。',tags:['救助','罕见病'],note:DEMO}
];
function policyFor(city,dept){return{
  updatedAt:'2026-08-01（演示）',
  scope:'参保类型（演示）：城乡居民基本医疗保险 / 职工基本医疗保险 / 少儿住院互助基金（部分地区）。不同参保类型的起付线、报销比例与封顶线不同。',
  settlementNote:'演示：本地就医通常可直接结算；异地就医一般需先备案或转诊，未备案时报销比例会降低。具体流程以参保地医保局口径为准。',
  ratios:[
   {item:'普通门诊',level:'社区／一级医院',ratio:'50%（演示）',note:'部分城市需先选定基层定点机构'},{item:'普通门诊',level:'三级医院',ratio:'40%（演示）',note:'经基层转诊的比例可能更高'},
   {item:'住院',level:'三级医院',ratio:'70%（演示）',note:'受起付线与年度封顶线影响'},{item:'门诊慢特病',level:'按病种认定',ratio:'60%（演示）',note:'需先办理病种备案'},
   {item:'大病保险',level:'起付线以上分段',ratio:'60%～75%（演示）',note:'各地分段口径不同'},{item:dept+'相关项目',level:'按项目',ratio:'见当地文件（演示）',note:'演示占位：此处应写该专科项目的报销口径'}
  ],
  notes:['演示数据：以上比例均为占位示例，不是任何医院或地区的真实政策。','真实报销比例受参保类型、就医层级、是否转诊备案、药品与耗材是否在目录内等因素影响。','实际报销金额请以医院结算单与参保地医保局答复为准。'],
  source:'演示数据，非真实来源'}}
hospitals.forEach(h=>{h.policy=policyFor(h.city,h.departments[0])});
function hospitalById(id){return hospitals.filter(h=>h.id===id)[0]||null}
const HOSPITAL_KEYS=['name','city','level','departments','address','officialSite','appointment'];
const POLICY_KEYS=['title','region','summary','sourceName','tags','publishedAt'];
function textOf(x,keys){return keys.map(k=>{const v=x[k];return Array.isArray(v)?v.join(' '):(v==null?'':String(v))}).join(' ').toLowerCase()}
function searchBy(list,keys,kw){const q=String(kw||'').trim().toLowerCase();if(!q)return list;const parts=q.split(/\s+/).filter(Boolean);return list.filter(x=>{const t=textOf(x,keys);return parts.every(p=>t.indexOf(p)>=0)})}
function searchHospitals(list,kw){return searchBy(list,HOSPITAL_KEYS,kw)}
function searchPolicies(list,kw){return searchBy(list,POLICY_KEYS,kw)}
function filterBy(list,key,value){if(!value||value==='全部')return list;return list.filter(x=>{let v=x[key];return Array.isArray(v)?v.indexOf(value)>=0:v===value})}
module.exports={DEMO,PAGE_NOTE,cities,departments,hospitals,regions,policies,filterBy,hospitalById,searchBy,searchHospitals,searchPolicies}
