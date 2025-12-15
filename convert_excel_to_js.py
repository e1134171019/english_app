import pandas as pd
import json
import os
from datetime import datetime

def convert_excel_to_js(excel_path, output_path):
    print(f"Reading {excel_path}...")
    try:
        df = pd.read_excel(excel_path)
    except FileNotFoundError:
        print(f"Error: File {excel_path} not found.")
        return
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return

    # Normalize columns carefully: lower case and strip spaces
    df.columns = [str(c).strip().lower().replace(' ', '_') for c in df.columns]
    print(f"DEBUG: Found Normalized Columns: {list(df.columns)}")
    
    
    # Expected columns mapping (Excel Header -> JS Property)
    # Normalized headers: english, translation, level, pos, phonetic, example_en, example_zh
    
    words_list = []
    
    for _, row in df.iterrows():
        # Helper to get value from multiple possible keys
        def get_val(keys):
            for k in keys:
                if k in df.columns:
                    val = str(row[k])
                    if val and val.lower() != 'nan':
                        return val.strip()
            return ""

        # 1. English (Required)
        english = get_val(['english', 'word', 'term'])
        if not english:
            continue

        item = {
            "english": english,
            "translation": get_val(['translation', 'zh', 'chinese', 'meaning']),
            "level": get_val(['level', 'tag']),
            "schoolLevel": get_val(['schoollevel', 'school_level']), # Bonus
            "pos": get_val(['pos', 'part_of_speech']),
            "phonetic": get_val(['phonetic', 'ipa', 'kk']),
            "exampleEn": get_val(['example_en', 'exampleen', 'sentence_en']).replace('"', '\\"'),
            "exampleZh": get_val(['example_zh', 'examplezh', 'sentence_zh']).replace('"', '\\"'),
            "past": get_val(['verb_past', 'past', 'past_tense']),
            "pp": get_val(['verb_pp', 'pp', 'past_participle']),
            "verb": None, # Deprecated or complex obj? Keeping for structure compatibility
            "synonyms": [],
            "family": "",
            "pattern": get_val(['pattern_main', 'type']),
            "patternZh": get_val(['pattern_zh', 'type_zh'])
        }
        
        # Optimize size: remove empty keys if desired? No, keep consistence.
        # words_list.append(item) # Removed duplicate append

        # Handle Verb (if exists)
        # 1. Check for single column 'verb' (go/went/gone)
        raw_verb = get_val(['verb', 'verb_forms'])
        if raw_verb:
             parts = raw_verb.split('/')
             if len(parts) >= 3:
                 item['verb'] = {"base": parts[0].strip(), "past": parts[1].strip(), "pp": parts[2].strip()}
        # 2. Check for separate columns if single column not found
        if not item['verb']:
            v_base = get_val(['verb_base', 'base'])
            v_past = get_val(['verb_past', 'past'])
            v_pp = get_val(['verb_pp', 'pp', 'ppart'])
            
            # Relaxed condition: If ANY verb form exists, populate the object
            if v_base or v_past or v_pp:
                 if not v_base:
                     v_base = english # Default to the word itself if base is missing
                 
                 item['verb'] = {
                     "base": v_base,
                     "past": v_past,
                     "pp": v_pp
                 }

        # Handle Synonyms (comma separated)
        syn_str = get_val(['synonyms', 'related'])
        if syn_str:
            item['synonyms'] = [s.strip() for s in syn_str.split(',') if s.strip()]

        words_list.append(item)

    # Generate JS Content
    timestamp = datetime.now().isoformat()
    js_content = f"""/**
 * Data generated from {os.path.basename(excel_path)}
 * Do not modify this file directly.
 * Generated at: {timestamp}
 */
export const wordsData = {json.dumps(words_list, ensure_ascii=False, indent=2)};
"""

    # Write
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"Success! Converted {len(words_list)} words to {output_path}")

if __name__ == "__main__":
    # Config
    EXCEL_FILE = "ENGLISH_10000_LEVELED.xlsx"
    OUTPUT_JS = "data/wordsData.js"
    
    # Run
    # Assume script is in web root d:\English_app\web
    convert_excel_to_js(EXCEL_FILE, OUTPUT_JS)
