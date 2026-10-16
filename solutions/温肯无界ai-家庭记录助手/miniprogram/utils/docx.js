/* 纯 JS 生成真正的 .docx：ZIP(store) + WordprocessingML，无后端、无第三方库 */
const CRC_TABLE=(function(){const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0}return t})();
function crc32(bytes){let c=0xFFFFFFFF;for(let i=0;i<bytes.length;i++)c=CRC_TABLE[(c^bytes[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function utf8(str){const out=[];for(let i=0;i<String(str).length;i++){let c=String(str).charCodeAt(i);if(c<0x80)out.push(c);else if(c<0x800)out.push(0xC0|(c>>6),0x80|(c&63));else if(c>=0xD800&&c<=0xDBFF&&i+1<String(str).length){const c2=String(str).charCodeAt(i+1);if(c2>=0xDC00&&c2<=0xDFFF){const cp=0x10000+((c-0xD800)<<10)+(c2-0xDC00);out.push(0xF0|(cp>>18),0x80|((cp>>12)&63),0x80|((cp>>6)&63),0x80|(cp&63));i++}else out.push(0xEF,0xBF,0xBD)}else out.push(0xE0|(c>>12),0x80|((c>>6)&63),0x80|(c&63))}return new Uint8Array(out)}
function zip(files){const parts=[],central=[];let offset=0;const now=new Date();const dosTime=((now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1))&0xFFFF;const dosDate=(((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate())&0xFFFF;
 files.forEach(function(f){const name=utf8(f.name),data=f.data,crc=crc32(data);
  const lh=new Uint8Array(30+name.length),d1=new DataView(lh.buffer);
  d1.setUint32(0,0x04034b50,true);d1.setUint16(4,20,true);d1.setUint16(6,0x0800,true);d1.setUint16(8,0,true);d1.setUint16(10,dosTime,true);d1.setUint16(12,dosDate,true);d1.setUint32(14,crc,true);d1.setUint32(18,data.length,true);d1.setUint32(22,data.length,true);d1.setUint16(26,name.length,true);d1.setUint16(28,0,true);lh.set(name,30);
  parts.push(lh,data);
  const ch=new Uint8Array(46+name.length),d2=new DataView(ch.buffer);
  d2.setUint32(0,0x02014b50,true);d2.setUint16(4,20,true);d2.setUint16(6,20,true);d2.setUint16(8,0x0800,true);d2.setUint16(10,0,true);d2.setUint16(12,dosTime,true);d2.setUint16(14,dosDate,true);d2.setUint32(16,crc,true);d2.setUint32(20,data.length,true);d2.setUint32(24,data.length,true);d2.setUint16(28,name.length,true);d2.setUint16(30,0,true);d2.setUint16(32,0,true);d2.setUint16(34,0,true);d2.setUint16(36,0,true);d2.setUint32(38,0,true);d2.setUint32(42,offset,true);ch.set(name,46);
  central.push(ch);offset+=lh.length+data.length});
 const cdSize=central.reduce(function(a,b){return a+b.length},0);
 const eocd=new Uint8Array(22),d3=new DataView(eocd.buffer);
 d3.setUint32(0,0x06054b50,true);d3.setUint16(8,files.length,true);d3.setUint16(10,files.length,true);d3.setUint32(12,cdSize,true);d3.setUint32(16,offset,true);
 const total=offset+cdSize+22,out=new Uint8Array(total);let p=0;
 parts.forEach(function(c){out.set(c,p);p+=c.length});central.forEach(function(c){out.set(c,p);p+=c.length});out.set(eocd,p);
 return out}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}
const FONT='<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="宋体"/>';
function run(text,o){o=o||{};let rpr='<w:rPr>'+FONT+(o.bold?'<w:b/>':'')+(o.color?'<w:color w:val="'+o.color+'"/>':'')+'<w:sz w:val="'+(o.size||22)+'"/><w:szCs w:val="'+(o.size||22)+'"/></w:rPr>';return '<w:r>'+rpr+'<w:t xml:space="preserve">'+esc(text)+'</w:t></w:r>'}
function para(text,o){o=o||{};return '<w:p><w:pPr><w:spacing w:after="'+(o.after==null?80:o.after)+'"/></w:pPr>'+run(text,o)+'</w:p>'}
function heading(text,level){return para(text,{bold:true,size:level===1?32:26,after:120})}
function cell(text,width,bold){return '<w:tc><w:tcPr><w:tcW w:w="'+width+'" w:type="dxa"/></w:tcPr>'+(text===''?'<w:p/>':para(text,{bold:!!bold,size:20,after:0}))+'</w:tc>'}
function table(headers,rows,widths){const border='<w:top w:val="single" w:sz="4" w:color="B7C4C0"/><w:left w:val="single" w:sz="4" w:color="B7C4C0"/><w:bottom w:val="single" w:sz="4" w:color="B7C4C0"/><w:right w:val="single" w:sz="4" w:color="B7C4C0"/><w:insideH w:val="single" w:sz="4" w:color="B7C4C0"/><w:insideV w:val="single" w:sz="4" w:color="B7C4C0"/>';
 const grid=widths.map(function(w){return '<w:gridCol w:w="'+w+'"/>'}).join('');
 const head='<w:tr>'+headers.map(function(h,i){return cell(h,widths[i],true)}).join('')+'</w:tr>';
 const body=rows.map(function(r){return '<w:tr>'+r.map(function(c,i){return cell(c==null?'':String(c),widths[i],false)}).join('')+'</w:tr>'}).join('');
 return '<w:tbl><w:tblPr><w:tblW w:w="'+widths.reduce(function(a,b){return a+b},0)+'" w:type="dxa"/><w:tblBorders>'+border+'</w:tblBorders></w:tblPr><w:tblGrid>'+grid+'</w:tblGrid>'+head+body+'</w:tbl><w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>'}
const SECT='<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="851" w:footer="992" w:gutter="0"/></w:sectPr>';
function pack(bodyXml){const doc='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+bodyXml+SECT+'</w:body></w:document>';
 const types='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
 const rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
 return zip([{name:'[Content_Types].xml',data:utf8(types)},{name:'_rels/.rels',data:utf8(rels)},{name:'word/document.xml',data:utf8(doc)}])}
function stamp(){const d=new Date(),p=function(n){return String(n).padStart(2,'0')};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())}
const NOTE='本文件由「家庭记录助手」在手机上离线生成，内容全部来自你手工录入，未经过任何服务器。它只是把记录整理在一起，不构成诊断或治疗建议；具体判断请以医生意见和原始报告为准。';
const ITEM_W=[1900,1600,1300,1900,2326];
const MED_W=[1900,2100,5026];
function itemRows(items){return (items||[]).map(function(i){return [i.name,i.value,i.unit||'',i.reference||'未提供',i.flag||'未标记']})}
function summaryDocx(state){state=state||{};const reports=(state.reports||[]).slice().sort(function(a,b){return String(a.date).localeCompare(String(b.date))});
 const symptoms=(state.symptoms||[]).slice().sort(function(a,b){return String(a.date).localeCompare(String(b.date))});
 const meds=(state.medications||[]).slice().sort(function(a,b){return String(a.date).localeCompare(String(b.date))});
 const missing=(state.missing||[]);
 const body=[];
 body.push(heading('家庭记录助手 · 就诊摘要',1));
 body.push(para('记录范围：'+(state.start||'全部')+' 至 '+(state.end||'今天')+'　｜　生成时间：'+stamp(),{size:20,color:'708681'}));
 body.push(para('报告 '+reports.length+' 份　｜　用药记录 '+meds.length+' 条　｜　症状记录 '+symptoms.length+' 条',{size:22}));
 body.push(heading('症状记录',2));
 if(!symptoms.length)body.push(para('本时间段内无症状记录。',{size:21,color:'708681'}));
 symptoms.forEach(function(s){body.push(para(s.date+'：'+s.text,{size:21}))});
 body.push(heading('用药记录',2));
 if(!meds.length)body.push(para('本时间段内无用药记录。',{size:21,color:'708681'}));
 else body.push(table(['起止','药名','剂量 · 用法 · 备注'],meds.map(function(m){return [m.endDate?(m.date+' 至 '+m.endDate):(m.date+' 起（未记录结束）'),m.name,[m.dose,m.frequency,m.note].filter(Boolean).join('　')]}),MED_W));
 body.push(heading('化验记录',2));
 if(!reports.length)body.push(para('本时间段内无化验报告。',{size:21,color:'708681'}));
 reports.forEach(function(r){body.push(para('['+r.date+'] '+(r.title||'化验报告')+'　来源：'+(r.source||'手动录入'),{bold:true,size:22,after:40}));body.push(table(['项目','结果','单位','参考范围','报告标记'],itemRows(r.items),ITEM_W))});
 body.push(heading('最近一份报告未包含的项目',2));
 body.push(para(missing.length?missing.join('、'):'五种常用指标都有',{size:21}));
 body.push(para(NOTE,{size:19,color:'8A672C'}));
 return pack(body.join(''))}
function reportDocx(report){report=report||{};const body=[];
 body.push(heading('家庭记录助手 · 化验报告',1));
 body.push(para('报告名称：'+(report.title||'化验报告'),{size:22}));
 body.push(para('采样日期：'+(report.date||'')+'　｜　来源：'+(report.source||'手动录入')+'　｜　导出时间：'+stamp(),{size:20,color:'708681'}));
 body.push(table(['项目','结果','单位','参考范围','报告标记'],itemRows(report.items),ITEM_W));
 body.push(para(NOTE,{size:19,color:'8A672C'}));
 return pack(body.join(''))}
module.exports={summaryDocx,reportDocx,crc32,utf8,zip}
