const d=require('../../utils/discover');
Page({
 data:{section:'resources',sections:[{id:'resources',label:'就医资源'},{id:'policy',label:'政策资讯'}],pageNote:d.PAGE_NOTE,demoNote:d.DEMO,
  cities:d.cities,activeCity:'全部',departments:d.departments,activeDept:'全部',hospitals:d.hospitals,kwH:'',
  regions:d.regions,activeRegion:'全部',policies:d.policies,kwP:''},
 switchSection(e){this.setData({section:e.currentTarget.dataset.section})},
 pickCity(e){this.setData({activeCity:e.currentTarget.dataset.value});this.applyHospitals()},
 pickDept(e){this.setData({activeDept:e.currentTarget.dataset.value});this.applyHospitals()},
 pickRegion(e){this.setData({activeRegion:e.currentTarget.dataset.value});this.applyPolicies()},
 inputKw(e){const k=e.currentTarget.dataset.which;this.setData({[k]:e.detail.value});if(k==='kwH')this.applyHospitals();else this.applyPolicies()},
 clearKw(e){const k=e.currentTarget.dataset.which;this.setData({[k]:''});if(k==='kwH')this.applyHospitals();else this.applyPolicies()},
 applyHospitals(){const base=d.filterBy(d.filterBy(d.hospitals,'city',this.data.activeCity),'departments',this.data.activeDept);this.setData({hospitals:d.searchHospitals(base,this.data.kwH)})},
 applyPolicies(){const base=d.filterBy(d.policies,'region',this.data.activeRegion);this.setData({policies:d.searchPolicies(base,this.data.kwP)})},
 openPolicy(e){wx.navigateTo({url:'/pages/policy/policy?id='+e.currentTarget.dataset.id})},
 demoOnly(){wx.showModal({title:'演示功能',content:'查看科室介绍、预约入口与收藏都需要权威数据源与服务端，本演示不含后端，这里只展示入口形态。相关政策是按医院展示的演示数据。',showCancel:false})}
})
