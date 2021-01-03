# SockJS-client-we-chat

原项目README(./ORIGIN_README.md)

# 摘要

支持微信小程序的[sockjs-client](https://github.com/sockjs/sockjs-client)分支, 增加了 `websocket-we-chat` 连接方式.

相对的, 因为微信小程序无法支持 [JSON3(因其对Object.prototype进行了操作)](https://bestiejs.github.io/json3/) , 
因此将JSON3都替换为原始的JSON对象, **这将导致一些低版本浏览器无法使用**.

# 微信小程序支持的连接方式

_Transport_          | _References_
---------------------|---------------
websocket-we-chat  | [微信小程序][^1]

[^1]: https://developers.weixin.qq.com/miniprogram/dev/api/network/websocket/wx.sendSocketMessage.html

# 用法

## 安装

```shell script
npm install sockjs-client-we-chat
```

默认情况下与SockJS-client相同, 如需使用指定的传输方式, 参考下例:

```javascript
const client = new SockJS(url, '', {
  transports: ['websocket-we-chat']
})
```
