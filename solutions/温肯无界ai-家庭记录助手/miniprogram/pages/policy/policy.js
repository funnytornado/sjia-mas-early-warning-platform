const d=require('../../utils/discover');
Page({
 data:{h:null,demo:d.DEMO,notFound:false},
 onLoad(q){const h=d.hospitalById((q&&q.id)||'');if(!h)this.setData({notFound:true});else this.setData({h:h})},
 back(){wx.navigateBack()}
})
