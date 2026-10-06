# Hitokoto-Cloudflare
使用 Cloudflare Pages 搭建的简洁、快速的一言（Hitokoto）API。

## 使用方法
1. 分叉此存储库。
2. 部署到 Cloudflare Pages，不需要设置框架、环境变量等。
3. 部署成功后直接访问即可，使用方法请参考 [一言开发者中心](https://developer.hitokoto.cn/sentence/)。

### SVG 动态卡片

除了 JSON / Text / JS 外，也支持直接返回 SVG，可用于 GitHub Profile README 等只允许嵌入图片的场景：

```text
https://hitokoto.xming.cloud/?encode=svg&max_length=28
```

例如：

![随机一言](https://hitokoto.xming.cloud/?encode=svg&max_length=28)


> 图片可能会被 GitHub 的图片代理缓存，因此“一言”会动态更新，但不保证每次刷新页面都立即变化。

## 待完成
- [ ] 支持指定返回字符集
- [x] 支持指定返回句子的长度筛选

## 声明
本仓库存储的程序是一个语录 API，语录数据来源于仓库根目录中的 sentences 文件夹，该数据集基于 [hitokoto-osc/sentences-bundle](https://github.com/hitokoto-osc/sentences-bundle)。本仓库作者不对数据内容的准确性或完整性负责，也不为其提供任何形式的保证。

著作权：本仓库中的语录数据并非完全由本仓库作者持有。如果您是原句作者且希望移除您的句子，请与 [hitokoto-osc](https://github.com/hitokoto-osc) 联系。

[molikai-work](https://github.com/molikai-work) 于2025/01/20（UTC+8）从 [hitokoto-osc/sentences-bundle](https://github.com/hitokoto-osc/sentences-bundle) 将 [sentences](https://github.com/hitokoto-osc/sentences-bundle/tree/master/sentences) 复制到了 [molikai-work/hitokoto-cloudflare](https://github.com/molikai-work/hitokoto-cloudflare) 的 [sentences](https://github.com/molikai-work/hitokoto-cloudflare/tree/main/sentences) 中。

## 许可证
本程序采用 AGPL-3.0 许可证授权。

这意味着，如果您修改了代码并且将修改后的版本发布或部署（例如作为服务），那么您必须公开源代码；  
如果您使用 AGPL-3.0 授权的代码构建服务，您的修改代码（如果有）也应当可供用户获取，并且这些用户有权查看和获取修改后的代码。
