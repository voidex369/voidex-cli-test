# 📊 MODEL CONNECTIVITY REPORT

**Date:** 2026-01-19  
**Tester:** VoidEx Agent  
**Tool:** `tests/test_model_connectivity.js`  
**Status:** ✅ COMPLETED

---

## 📈 SUMMARY

| Metric | Count |
|--------|-------|
| **Total Models Tested** | 24 |
| **✅ Active Models** | 13 (54.2%) |
| **❌ Inactive Models** | 11 (45.8%) |

---

## ✅ ACTIVE MODELS (13)

These models are confirmed working and can be used safely:

| # | Model Name | Status | Notes |
|---|------------|--------|-------|
| 1 | `xiaomi/mimo-v2-flash:free` | ✅ Active | Xiaomi Model |
| 2 | `arcee-ai/trinity-mini:free` | ✅ Active | Trinity Mini |
| 3 | `cognitivecomputations/dolphin-mistral-24b-venice-edition:free` | ✅ Active | **Uncensored** |
| 4 | `nousresearch/hermes-3-llama-3.1-405b:free` | ✅ Active | **Uncensored** |
| 5 | `mistralai/mixtral-8x22b-instruct` | ✅ Active | **Uncensored** |
| 6 | `google/gemini-2.5-flash-image` | ✅ Active | Gemini 2.5 |
| 7 | `google/gemini-2.5-flash-lite` | ✅ Active | Gemini Lite |
| 8 | `meta-llama/llama-3-70b-instruct` | ✅ Active | Meta Llama 3 |
| 9 | `mistralai/devstral-2512:free` | ✅ Active | Mistral Devstral |
| 10 | `nvidia/nemotron-3-nano-30b-a3b:free` | ✅ Active | Nvidia Nemotron |
| 11 | `openai/gpt-4o` | ✅ Active | GPT-4o |
| 12 | `qwen/qwen3-coder:free` | ✅ Active | Qwen3 Coder |
| 13 | `z-ai/glm-4.5-air:free` | ✅ Active | GLM 4.5 |

---

## ❌ INACTIVE MODELS (11)

These models return errors or are no longer available on OpenRouter:

| Model Name | Error Code | Reason |
|------------|------------|--------|
| `alibaba/tongyi-deepresearch-30b-a3b:free` | 404 | Not Found |
| `allenai/olmo-3-32b-think:free` | 404 | Not Found |
| `allenai/olmo-3.1-32b-think:free` | 404 | Not Found |
| `anthropic/claude-3-opus` | 404 | Not Found |
| `anthropic/claude-3-sonnet` | 404 | Not Found |
| `liquid/lfm-40b:free` | 404 | Not Found |
| `google/gemini-2.0-flash-exp:free` | 429 | Provider Error / Rate Limit |
| `mistral/mistral-large` | 400 | Not Available |
| `moonshotai/kimi-k2:free` | 404 | Not Found |
| `nex-agi/deepseek-v3.1-nex-n1:free` | 404 | Not Found |
| `openai/gpt-oss-120b:free` | 404 | Not Found |

---

## 🔧 ACTIONS TAKEN

### 1. Fixed Command Routing Bug
- **Issue:** `/model`, `/auth`, `/theme` commands not working
- **Root Cause:** Commands not routed to UI dialogs
- **Fix:** Added proper routing in `Chat.tsx` `handleSend()` function
- **Files Modified:**
  - `src/ui/components/Chat.tsx`
  - `src/ui/hooks/useChat.ts`

### 2. Updated Model List
- **Action:** Removed 11 inactive models from `MODEL_TEMPLATES`
- **Result:** Cleaner model picker, only working models shown
- **File Modified:** `src/lib/config.ts`

### 3. Created Test Suite
- **New File:** `tests/test_model_connectivity.js`
- **Purpose:** Automated testing of all models
- **Output:** `model_connectivity_report.json`

---

## 💡 RECOMMENDATIONS

### For Users
1. **Preferred Models:**
   - **Free/Cheap:** `google/gemini-2.5-flash-lite`
   - **Performance:** `openai/gpt-4o`
   - **Uncensored:** `cognitivecomputations/dolphin-mistral-24b-venice-edition:free`

2. **Avoid:** Don't use inactive models (they'll return errors)

### For Developers
1. **Auto-Cleanup:** Consider running `test_model_connectivity.js` weekly
2. **Fallback:** Implement fallback to active model if current model fails
3. **Caching:** Cache active model list to reduce API calls

---

## 📁 FILES CREATED/UPDATED

```
/home/voidex/gemini/github/voidex-cli_back1/
├── src/lib/config.ts                    (Updated - Removed inactive models)
├── src/ui/components/Chat.tsx           (Fixed - Command routing)
├── src/ui/hooks/useChat.ts              (Fixed - Session selection)
├── tests/test_model_connectivity.js     (New - Test script)
├── model_connectivity_report.json       (Generated - Test results)
└── MODEL_CONNECTIVITY_REPORT.md         (This file)
```

---

## 🚀 NEXT STEPS

1. ✅ Test the application with new model list
2. ✅ Verify `/model`, `/auth`, `/theme` commands work correctly
3. ⏳ Consider adding model health check on startup
4. ⏳ Add model categories (Free, Uncensored, Paid, Legacy)

---

**Report Generated:** 2026-01-19 09:21:35 UTC  
**System:** VoidEx CLI v1.0.0
