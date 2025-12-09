from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
import json

app = Flask(__name__)
CORS(app)  # 允許前端跨域請求

# 讀取 .env 檔案
def load_env():
    api_key = None
    base_url = "https://models.inference.ai.azure.com"
    
    try:
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("GITHUB_MODELS_TOKEN="):
                    api_key = line.split("=", 1)[1]
                elif line.startswith("GITHUB_MODELS_ENDPOINT="):
                    base_url = line.split("=", 1)[1]
    except FileNotFoundError:
        raise RuntimeError("找不到 .env 檔案")
    
    if not api_key:
        raise RuntimeError("找不到 GITHUB_MODELS_TOKEN")
    
    return api_key, base_url

# 初始化 OpenAI client
api_key, base_url = load_env()
client = OpenAI(api_key=api_key, base_url=base_url)

@app.route('/api/generate-card', methods=['POST'])
def generate_card():
    try:
        data = request.json
        word = data.get('word', '').strip()
        
        if not word:
            return jsonify({'error': '請提供英文單字'}), 400
        
        # 建立 AI prompt
        prompt = f"""請為英文單字 "{word}" 生成完整的學習卡片資料，以 JSON 格式回應。

要求：
1. word: 單字本身
2. chineseFront: 主要中文翻譯（簡短，適合卡片正面顯示）
3. pos: 詞性（如 n., v., adj., adv. 等）
4. phonetic: 音標（KK音標或IPA都可）
5. meaning: 英文解釋 + 中文說明（格式：English explanation. (中文說明)）
6. collocations: 2-4個常用搭配詞或相關家族單字（包含詞根相同、格林法則相關、同源詞等），每個都要有中文翻譯（格式：["collocation/family word (中文)"]）
7. sentence1: 一個實用例句，包含 en（英文） 和 cn（中文）
8. sentence2: 設為 null（只需要一個例句）

請直接回傳 JSON，不要有其他文字說明。範例格式：
{{
  "word": "Example",
  "chineseFront": "例子",
  "pos": "n.",
  "phonetic": "/ɪɡˈzæm.pəl/",
  "meaning": "Something that is typical of a group. (某類事物的典型)",
  "collocations": ["exemplary (模範的)", "exemplify (例證)", "for example (例如)", "set an example (樹立榜樣)"],
  "sentence1": {{"en": "This is a good example of teamwork.", "cn": "這是團隊合作的好例子。"}},
  "sentence2": null
}}

注意：collocations 應包含詞根相同的家族單字（如 -dict- 詞根：predict, dictate, dictionary）或格林法則相關字（如 father/pater, three/tri）"""

        # 呼叫 AI
        print(f"正在為單字 '{word}' 生成卡片...")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert English teacher. Always respond with valid JSON only, no additional text."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )
        
        # 解析 AI 回應
        ai_response = response.choices[0].message.content.strip()
        
        # 移除可能的 markdown 程式碼區塊標記
        if ai_response.startswith("```json"):
            ai_response = ai_response[7:]
        if ai_response.startswith("```"):
            ai_response = ai_response[3:]
        if ai_response.endswith("```"):
            ai_response = ai_response[:-3]
        ai_response = ai_response.strip()
        
        # 解析 JSON
        card_data = json.loads(ai_response)
        
        # 獲取 token 使用量
        usage = response.usage
        tokens_used = {
            'prompt_tokens': usage.prompt_tokens,
            'completion_tokens': usage.completion_tokens,
            'total_tokens': usage.total_tokens
        }
        
        print(f"✓ 成功生成單字卡: {word}")
        print(f"  Token 使用: prompt={usage.prompt_tokens}, completion={usage.completion_tokens}, total={usage.total_tokens}")
        
        return jsonify({
            'card': card_data,
            'tokens': tokens_used
        })
        
    except json.JSONDecodeError as e:
        print(f"JSON 解析錯誤: {e}")
        print(f"AI 回應: {ai_response}")
        return jsonify({'error': 'AI 回應格式錯誤，請重試'}), 500
    except Exception as e:
        print(f"錯誤: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'API 運作中'})

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 英文字卡 AI 生成服務啟動中...")
    print("=" * 60)
    print("API 端點:")
    print("  - POST /api/generate-card  (生成單字卡)")
    print("  - GET  /api/health         (健康檢查)")
    print("=" * 60)
    app.run(host='127.0.0.1', port=5000, debug=True)
