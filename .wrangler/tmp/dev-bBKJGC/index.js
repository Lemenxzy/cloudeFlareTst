var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-LVKpDo/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-LVKpDo/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// workers/index.ts
var messages = [];
async function callOpenAI(userMessage, env, retries = 3) {
  console.log("callOpenAI called with:", { userMessage, retries });
  if (!env.OPENAI_API_KEY || !env.OPENAI_API_KEY.startsWith("sk-")) {
    throw new Error("Invalid OpenAI API Key format");
  }
  const openaiMessages = [
    {
      role: "system",
      content: "\u4F60\u662F\u4E00\u4E2A\u6709\u7528\u7684AI\u52A9\u624B\uFF0C\u8BF7\u7528\u4E2D\u6587\u56DE\u7B54\u95EE\u9898\u3002\u4F60\u7684\u56DE\u7B54\u5E94\u8BE5\u8BE6\u7EC6\u3001\u51C6\u786E\uFF0C\u5E76\u4E14\u4F7F\u7528Markdown\u683C\u5F0F\u6765\u7EC4\u7EC7\u5185\u5BB9\uFF0C\u5305\u62EC\u6807\u9898\u3001\u5217\u8868\u3001\u4EE3\u7801\u5757\u7B49\u683C\u5F0F\u5316\u5143\u7D20\u3002\u5F53\u56DE\u7B54\u6280\u672F\u95EE\u9898\u65F6\uFF0C\u8BF7\u63D0\u4F9B\u5177\u4F53\u7684\u4EE3\u7801\u793A\u4F8B\u548C\u6B65\u9AA4\u8BF4\u660E\u3002"
    },
    {
      role: "user",
      content: userMessage
    }
  ];
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} to call OpenAI API`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3e4);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: openaiMessages,
          stream: true,
          max_tokens: 2e3,
          temperature: 0.7
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        return response;
      }
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("Retry-After") || "1");
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1e3));
        continue;
      }
      const errorText = await response.text();
      console.error(`OpenAI API error (attempt ${attempt + 1}):`, response.status, errorText);
      if (attempt === retries - 1) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1e3));
    } catch (error) {
      console.error(`OpenAI request failed (attempt ${attempt + 1}):`, error);
      if (attempt === retries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1e3));
    }
  }
  throw new Error("Failed to call OpenAI after all retries");
}
__name(callOpenAI, "callOpenAI");
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};
var resolvers = {
  Query: {
    getMessages: () => messages
  },
  Mutation: {
    sendMessage: async (_, { input }) => {
      const message = {
        id: Date.now().toString(),
        content: input.content,
        sender: input.sender,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        isAI: false
      };
      messages.push(message);
      return message;
    }
  }
};
async function handleGraphQL(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const body = await request.json();
  if (body.query.includes("sendMessage")) {
    const match = body.query.match(/sendMessage\s*\(\s*input:\s*\$input\s*\)/);
    if (match && body.variables?.input) {
      const message = await resolvers.Mutation.sendMessage(null, { input: body.variables.input });
      return new Response(JSON.stringify({
        data: { sendMessage: message }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
  if (body.query.includes("getMessages")) {
    const result = resolvers.Query.getMessages();
    return new Response(JSON.stringify({
      data: { getMessages: result }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ error: "Query not supported" }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(handleGraphQL, "handleGraphQL");
async function handleSSE(request, env) {
  const url = new URL(request.url);
  const messageId = url.pathname.split("/")[2];
  const userMessage = url.searchParams.get("message") || "";
  console.log(`SSE request: messageId=${messageId}, message=${userMessage}`);
  if (!env.OPENAI_API_KEY) {
    console.error("OpenAI API key not configured");
    return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const streamResponse = /* @__PURE__ */ __name(async () => {
    try {
      console.log("Starting OpenAI API call...");
      await writer.write(new TextEncoder().encode(`data: ${JSON.stringify({
        content: "\u6B63\u5728\u8FDE\u63A5AI\u52A9\u624B...",
        isComplete: false,
        messageId
      })}

`));
      const isTestKey = env.OPENAI_API_KEY.includes("test-fake-key");
      if (isTestKey) {
        console.log("Using development fallback response");
        const decodedMessage = decodeURIComponent(userMessage);
        const responses = [
          `## \u4F60\u597D\uFF01\u{1F44B}

`,
          `\u6211\u6536\u5230\u4E86\u4F60\u7684\u6D88\u606F\uFF1A"${decodedMessage}"

`,
          `### \u6211\u7684\u56DE\u590D

\u8FD9\u662F\u4E00\u4E2A\u5F88\u597D\u7684\u95EE\u9898\uFF01

`,
          `*\u6CE8\u610F\uFF1A\u5F53\u524D\u4F7F\u7528\u5F00\u53D1\u6A21\u5F0F\uFF0C\u8BF7\u914D\u7F6E\u771F\u5B9E\u7684OpenAI API Key\u3002*`
        ];
        for (let i = 0; i < responses.length; i++) {
          const chunk = responses[i];
          const streamData = {
            content: chunk,
            isComplete: i === responses.length - 1,
            messageId
          };
          await writer.write(new TextEncoder().encode(`data: ${JSON.stringify(streamData)}

`));
          if (i < responses.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
        return;
      }
      console.log("Calling OpenAI API...");
      console.log("API Key length:", env.OPENAI_API_KEY?.length);
      console.log("User message:", decodeURIComponent(userMessage));
      const openaiResponse = await callOpenAI(userMessage, env);
      console.log("OpenAI response received, status:", openaiResponse.status);
      const reader = openaiResponse.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get OpenAI response stream");
      }
      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("OpenAI stream completed");
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              console.log("OpenAI stream finished");
              const finalData = {
                content: "",
                isComplete: true,
                messageId
              };
              await writer.write(new TextEncoder().encode(`data: ${JSON.stringify(finalData)}

`));
              break;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || "";
              if (content) {
                console.log("Streaming content chunk:", content);
                fullContent += content;
                const streamData = {
                  content,
                  isComplete: false,
                  messageId
                };
                await writer.write(new TextEncoder().encode(`data: ${JSON.stringify(streamData)}

`));
              }
            } catch (e) {
              console.log("Skipping invalid JSON line:", data);
              continue;
            }
          }
        }
      }
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: fullContent,
        sender: "AI Assistant",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        isAI: true
      };
      messages.push(aiMessage);
    } catch (error) {
      console.error("OpenAI streaming error:", error);
      let errorMessage = "\u672A\u77E5\u9519\u8BEF";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      const errorData = {
        content: `\u62B1\u6B49\uFF0C\u6211\u9047\u5230\u4E86\u4E00\u4E9B\u6280\u672F\u95EE\u9898\uFF1A${errorMessage}`,
        isComplete: true,
        messageId,
        error: true
      };
      await writer.write(new TextEncoder().encode(`data: ${JSON.stringify(errorData)}

`));
    } finally {
      await writer.close();
    }
  }, "streamResponse");
  streamResponse();
  return new Response(readable, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
__name(handleSSE, "handleSSE");
var workers_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/graphql") {
      return handleGraphQL(request, env);
    }
    if (url.pathname.startsWith("/sse/")) {
      return handleSSE(request, env);
    }
    return new Response("AI Chat API", {
      headers: corsHeaders
    });
  }
};

// node_modules/.pnpm/wrangler@3.114.13/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/.pnpm/wrangler@3.114.13/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-LVKpDo/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = workers_default;

// node_modules/.pnpm/wrangler@3.114.13/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-LVKpDo/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
