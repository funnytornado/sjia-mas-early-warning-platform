const store=require('../../utils/store'),engine=require('../../utils/engine');
const defaults=()=>({name:'',gender:'未填写',birth:'',guardian:'',relation:'',phone:'',emgName:'',emgPhone:'',emgRelation:'',emg2Name:'',emg2Phone:'',emg2Relation:''});
Page({
 data:{p:defaults(),age:'',genders:['未填写','男','女']},
 onShow(){let p=Object.assign(defaults(),store.profile()||{});this.setData({p:p,age:engine.ageFrom(p.birth)})},
 field(e){let k=e.currentTarget.dataset.key;this.setData({['p.'+k]:e.detail.value});if(k==='birth')this.setData({age:engine.ageFrom(e.detail.value)})},
 save(){store.saveProfile(this.data.p)},
 pickGender(e){this.setData({'p.gender':this.data.genders[Number(e.detail.value)]});store.saveProfile(this.data.p)},
 goEmergency(){wx.navigateTo({url:'/pages/emergency/emergency'})},
 clearPersonal(){wx.showModal({title:'清空个人信息与急诊卡？',content:'只删除本机上的基本信息与急诊卡内容，化验、症状、用药记录不受影响，且不可恢复。',success:r=>{if(r.confirm){store.saveProfile({});store.saveEmergency({});this.setData({p:defaults(),age:''});wx.showToast({title:'已清空'})}}})}
})
