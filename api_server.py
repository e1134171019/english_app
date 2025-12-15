"""
Flask API Server for AI-powered English Word Translation
使用 Google Gemini API 提供單字翻譯服務
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai

app = Flask(__name__)
CORS(app)  # 允許前端跨域請求

# 配置 Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyA-ch48PvSlmMQcrGz8NSTrIIqUwAV4qUk')
genai.configure(api_key=GEMINI_API_KEY)

# 使用 Gemini Pro 模型（穩定版）
model = genai.GenerativeModel('gemini-pro')

@app.route('/api/generate-card', methods=['POST'])
def generate_card():
    """
    生成英文單字卡片
    
    請求格式:
    {
        "word": "abandon"
    }
    
    回應格式:
    {
        "card": {
            "english": "abandon",
            "translation": "放棄；遺棄",
            "pos": "v.",
            "phonetic": "/əˈbændən/",
            "exampleEn": "They had to abandon their car.",
            "exampleZh": "他們不得不拋棄他們的車。"
        }
    }
    """
    try:
        data = request.get_json()
        word = data.get('word', '').strip()
        
        if not word:
            return jsonify({'error': '請提供英文單字'}), 400
        
        print(f"[API] Generating card for: {word}")
        
        # 建立提示詞
        prompt = f"""請提供英文單字 "{word}" 的以下資訊（用繁體中文）：

1. 中文翻譯（最常用的意思）
2. 詞性（如 n., v., adj. 等）
3. 音標（美式發音）
4. 一個實用的英文例句
5. 例句的中文翻譯

請用 JSON 格式回答：
{{
  "translation": "中文翻譯",
  "pos": "詞性",
  "phonetic": "音標",
  "exampleEn": "英文例句",
  "exampleZh": "例句中文翻譯"
}}

只需要 JSON，不要其他文字。"""

        # 呼叫 Gemini API
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        print(f"[API] Gemini response: {response_text[:100]}...")
        
        # 解析回應
        import json
        import re
        
        # 提取 JSON（移除 markdown 代碼塊）
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            card_data = json.loads(json_match.group())
        else:
            # 降級處理
            card_data = {
                "translation": response_text.split('\n')[0][:50],
                "pos": "",
                "phonetic": "",
                "exampleEn": "",
                "exampleZh": ""
            }
        
        # 標準化格式
        card = {
            "english": word,
            "translation": card_data.get("translation", word),
            "chineseFront": card_data.get("translation", word),
            "pos": card_data.get("pos", ""),
            "phonetic": card_data.get("phonetic", ""),
            "exampleEn": card_data.get("exampleEn", ""),
            "exampleZh": card_data.get("exampleZh", "")
        }
        
        print(f"[API] ✓ Card generated successfully")
        return jsonify({'card': card})
        
    except Exception as e:
        print(f"[API] Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """健康檢查端點"""
    return jsonify({
        'status': 'ok',
        'model': 'gemini-1.5-flash',
        'api_key_configured': bool(GEMINI_API_KEY and GEMINI_API_KEY != 'YOUR_API_KEY')
    })

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 AI Translation API Server")
    print("=" * 50)
    print(f"📍 Running on: http://127.0.0.1:5000")
    print(f"🔑 API Key: {'✓ Configured' if GEMINI_API_KEY else '✗ Not Set'}")
    print(f"🤖 Model: gemini-1.5-flash")
    print("=" * 50)
    print("\n⚠️  請確保已安裝套件:")
    print("   pip install flask flask-cors google-generativeai")
    print("\n準備就緒！前端可呼叫 /api/generate-card")
    print("=" * 50)
    
    app.run(host='127.0.0.1', port=5000, debug=True)
