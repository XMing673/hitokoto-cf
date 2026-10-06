# Hitokoto-Cloudflare
使用 Cloudflare Pages 搭建的简洁、快速的一言（Hitokoto）API。

## 使用方法
1. 分叉此存储库。
2. 部署到 Cloudflare Pages。Pages 会根据 `package-lock.json` 自动安装依赖，无需额外填写 Build command。
3. 在 **Settings → Functions → Compatibility Flags** 中为 Production 和 Preview 启用 `nodejs_compat`；或将 Compatibility Date 更新到 `2026-08-04` 及以后。
4. 部署成功后直接访问即可，使用方法请参考 [一言开发者中心](https://developer.hitokoto.cn/sentence/)。

> `iconv-lite` 依赖 Node.js 的 `buffer` / `string_decoder`，因此 Pages Functions 需要 Node.js compatibility。

### SVG 动态卡片

除了 JSON / Text / JS 外，也支持直接返回 SVG，可用于 GitHub Profile README 等只允许嵌入图片的场景：

```text
https://hitokoto.xming.cloud/?encode=svg&max_length=28
```

例如：

![随机一言](https://hitokoto.xming.cloud/?encode=svg&max_length=28)


> 图片可能会被 GitHub 的图片代理缓存，因此“一言”会动态更新，但不保证每次刷新页面都立即变化。


### 字符集

默认使用 UTF-8。传入 `charset=gbk` 时会实际以 GBK 字节编码返回，而不只是修改响应头：

```text
https://hitokoto.xming.cloud/?encode=text&charset=gbk
```

与一言 v1 接口保持一致，GBK 不支持与 `callback` 同时使用；其他未知的 `charset` 值按 UTF-8 处理。

### 长度筛选

```text
https://hitokoto.xming.cloud/?min_length=10&max_length=20
```

- `min_length`：最小长度，默认 `0`，允许显式传入 `0`
- `max_length`：最大长度，默认 `30`

## 声明
本仓库存储的程序是一个语录 API，语录数据来源于仓库根目录中的 sentences 文件夹，该数据集基于 [hitokoto-osc/sentences-bundle](https://github.com/hitokoto-osc/sentences-bundle)。本仓库作者不对数据内容的准确性或完整性负责，也不为其提供任何形式的保证。

著作权：本仓库中的语录数据并非完全由本仓库作者持有。如果您是原句作者且希望移除您的句子，请与 [hitokoto-osc](https://github.com/hitokoto-osc) 联系。

[molikai-work](https://github.com/molikai-work) 于2025/01/20（UTC+8）从 [hitokoto-osc/sentences-bundle](https://github.com/hitokoto-osc/sentences-bundle) 将 [sentences](https://github.com/hitokoto-osc/sentences-bundle/tree/master/sentences) 复制到了 [molikai-work/hitokoto-cloudflare](https://github.com/molikai-work/hitokoto-cloudflare) 的 [sentences](https://github.com/molikai-work/hitokoto-cloudflare/tree/main/sentences) 中。

## 许可证
本程序采用 AGPL-3.0 许可证授权。

这意味着，如果您修改了代码并且将修改后的版本发布或部署（例如作为服务），那么您必须公开源代码；  
如果您使用 AGPL-3.0 授权的代码构建服务，您的修改代码（如果有）也应当可供用户获取，并且这些用户有权查看和获取修改后的代码。
