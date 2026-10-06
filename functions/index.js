import iconv from "iconv-lite";
import a from "../sentences/a.json";
import b from "../sentences/b.json";
import c from "../sentences/c.json";
import d from "../sentences/d.json";
import e from "../sentences/e.json";
import f from "../sentences/f.json";
import g from "../sentences/g.json";
import h from "../sentences/h.json";
import i from "../sentences/i.json";
import j from "../sentences/j.json";
import k from "../sentences/k.json";
import l from "../sentences/l.json";

const sentencesMap = {
    a,
    b,
    c,
    d,
    e,
    f,
    g,
    h,
    i,
    j,
    k,
    l,
};

const responseHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "X-Content-Type-Options": "nosniff",
    "X-Source-Code": "https://github.com/molikai-work/hitokoto-cloudflare",
};

const CALLBACK_PATTERN = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/;


function normalizeCharset(charset) {
    const normalized = (charset || "utf-8").trim().toLowerCase();

    if (normalized === "gbk") {
        return "gbk";
    }

    return "utf-8";
}

function encodeResponseBody(content, charset) {
    if (charset === "gbk") {
        return iconv.encode(content, "gbk");
    }

    return content;
}

function createEncodedResponse(content, contentType, charset = "utf-8", extraHeaders = {}, status = 200) {
    const normalizedCharset = normalizeCharset(charset);
    const charsetLabel = normalizedCharset === "gbk" ? "GBK" : "UTF-8";

    return new Response(encodeResponseBody(content, normalizedCharset), {
        status,
        headers: {
            "Content-Type": `${contentType}; charset=${charsetLabel}`,
            ...extraHeaders,
            ...responseHeaders,
        },
    });
}

function createResponse(code, message, extraData = {}, extraHeaders = {}) {
    return Response.json({
        code,
        message,
        timestamp: Date.now(),
        ...extraData,
    }, {
        headers: {
            ...extraHeaders,
            ...responseHeaders,
        },
        status: code,
    });
}

function handleError(code, error, devEnv, customMessage = "服务器内部错误") {
    if (devEnv === "true") {
        return createResponse(code, error.message);
    }

    return createResponse(code, customMessage);
}

function isValidPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
}

function isValidNonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
}

function isValidCallbackName(callback) {
    return CALLBACK_PATTERN.test(callback);
}

function getSentencesByCategory(categoryKey) {
    if (!categoryKey) {
        return null;
    }

    return sentencesMap[categoryKey] || null;
}

function getRandomCategorySentences() {
    const keys = Object.keys(sentencesMap);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return sentencesMap[randomKey];
}

function buildResponsePayload(sentence) {
    return {
        id: sentence.id,
        uuid: sentence.uuid,
        hitokoto: sentence.hitokoto,
        type: sentence.type,
        from: sentence.from,
        from_who: sentence.from_who,
        creator: sentence.creator,
        creator_uid: sentence.creator_uid,
        reviewer: sentence.reviewer,
        commit_from: sentence.commit_from,
        created_at: sentence.created_at,
        length: sentence.length,
    };
}

function buildJavascriptResponse(sentence, selector) {
    const hitokotoText = JSON.stringify(sentence.hitokoto);
    const selectorText = JSON.stringify(selector || ".hitokoto");

    return `(function hitokoto(){var hitokoto=${hitokotoText};var selector=${selectorText};try{var dom=document.querySelector(selector);if(dom){dom.innerText=hitokoto;}}catch(error){}})()`;
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function escapeXml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

function truncateText(value, maxLength = 28) {
    const text = String(value || "");
    return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function buildSvgResponse(sentence) {
    const quote = escapeXml(truncateText(sentence.hitokoto, 34));
    const sourceParts = [];

    if (sentence.from_who) {
        sourceParts.push(sentence.from_who);
    }

    if (sentence.from) {
        sourceParts.push(`《${sentence.from}》`);
    }

    const source = escapeXml(truncateText(
        sourceParts.length ? `—— ${sourceParts.join(" ")}` : "—— 一言",
        32,
    ));

    return `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="104" viewBox="0 0 780 104" role="img" aria-label="${quote}">
<style>
    .bg { fill: #ffffff; stroke: #d0d7de; }
    .quote { fill: #1f2328; font: 600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "Microsoft YaHei", sans-serif; }
    .source { fill: #656d76; font: 13px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "Microsoft YaHei", sans-serif; }
    @media (prefers-color-scheme: dark) {
        .bg { fill: #0d1117; stroke: #30363d; }
        .quote { fill: #f0f6fc; }
        .source { fill: #8b949e; }
    }
</style>
<rect class="bg" x="0.5" y="0.5" width="779" height="103" rx="12"/>
<text class="quote" x="28" y="44">「${quote}」</text>
<text class="source" x="752" y="76" text-anchor="end">${source}</text>
</svg>`;
}

function buildBrowserPage(response) {
    const json = escapeHtml(JSON.stringify(response, null, 2));

    return `<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>明域｜一言</title>
    <link rel="icon" href="https://www.xming.cloud/assets/xming.ico">
</head>
<body>
    <pre>${json}</pre>
</body>
</html>`;
}

export async function onRequest(context) {
    const { request, env } = context;

    try {
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    ...responseHeaders,
                },
            });
        }

        const url = new URL(request.url);
        const categoryKey = url.searchParams.get("c");
        const encodeType = url.searchParams.get("encode");
        const callback = url.searchParams.get("callback");
        const select = url.searchParams.get("select");
        const charset = normalizeCharset(url.searchParams.get("charset"));

        const minLength = url.searchParams.has("min_length")
            ? Number.parseInt(url.searchParams.get("min_length"), 10)
            : 0;
        const maxLength = url.searchParams.has("max_length")
            ? Number.parseInt(url.searchParams.get("max_length"), 10)
            : 30;

        if (url.searchParams.has("min_length") && !isValidNonNegativeInteger(minLength)) {
            return createResponse(400, "min_length 必须是非负整数");
        }

        if (url.searchParams.has("max_length") && !isValidPositiveInteger(maxLength)) {
            return createResponse(400, "max_length 必须是正整数");
        }

        if (maxLength < minLength) {
            return createResponse(400, "max_length 不能小于 min_length");
        }

        if (callback && !isValidCallbackName(callback)) {
            return createResponse(400, "callback 格式无效");
        }

        if (charset === "gbk" && callback) {
            return createResponse(400, "GBK 字符集不支持与 callback 同时使用");
        }

        let sentences = getSentencesByCategory(categoryKey) || getRandomCategorySentences();

        if (minLength || maxLength) {
            if (categoryKey) {
                sentences = getSentencesByCategory(categoryKey) || [];
            } else {
                sentences = Object.values(sentencesMap).flat();
            }

            sentences = sentences.filter((sentence) => {
                const isMinLengthValid = !minLength || sentence.length >= minLength;
                const isMaxLengthValid = !maxLength || sentence.length <= maxLength;
                return isMinLengthValid && isMaxLengthValid;
            });

            if (sentences.length === 0) {
                if (categoryKey) {
                    return createResponse(404, "没有在该类别找到符合长度条件的一言");
                }

                return createResponse(404, "没有找到符合长度条件的一言");
            }
        }

        const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
        const response = buildResponsePayload(randomSentence);

        const acceptsHtml = request.headers.get("Accept")?.includes("text/html");
        const isHomepage = url.pathname === "/" && url.search === "";

        if (acceptsHtml && isHomepage) {
            return new Response(buildBrowserPage(response), {
                headers: {
                    "Content-Type": "text/html; charset=UTF-8",
                    ...responseHeaders,
                },
            });
        }

        if (encodeType === "svg") {
            return new Response(buildSvgResponse(randomSentence), {
                headers: {
                    "Content-Type": "image/svg+xml; charset=UTF-8",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    ...responseHeaders,
                },
            });
        }

        if (encodeType === "text") {
            const responseContent = callback
                ? `;${callback}(${JSON.stringify(randomSentence.hitokoto)});`
                : randomSentence.hitokoto;
            const contentType = callback ? "application/javascript" : "text/plain";

            return createEncodedResponse(responseContent, contentType, charset);
        }

        if (encodeType === "js") {
            const jsContent = buildJavascriptResponse(randomSentence, select);
            const finalContent = callback
                ? `;${callback}(${JSON.stringify(jsContent)});`
                : jsContent;

            return createEncodedResponse(finalContent, "application/javascript", charset);
        }

        if ((!encodeType || encodeType === "json") && callback) {
            const jsonResponse = JSON.stringify(response);
            const jsonCallbackContent = `;${callback}(${JSON.stringify(jsonResponse)});`;

            return createEncodedResponse(jsonCallbackContent, "application/javascript", charset);
        }

        return createEncodedResponse(JSON.stringify(response), "application/json", charset);
    } catch (error) {
        console.error("Unexpected error:", error);
        return handleError(500, error, env.DEV_ENV);
    }
}
