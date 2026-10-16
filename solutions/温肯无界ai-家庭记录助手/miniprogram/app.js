App({
  onError(e) {
    try {
      const msg = (e && (e.message ? e.message + ' | ' + (e.stack || '') : e)) || '未知错误';
      wx.setStorageSync('sjia-last-error', String(msg).slice(0, 400));
    } catch (_) {}
  },
  onUnhandledRejection(res) {
    try {
      const r = res && res.reason;
      wx.setStorageSync('sjia-last-error', String((r && r.message) || r || '未处理的 Promise 拒绝').slice(0, 400));
    } catch (_) {}
  }
});
