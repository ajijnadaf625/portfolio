import os
import glob
import re

files = glob.glob('src/**/*.jsx', recursive=True)

def process_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    original = content
    
    # 1. Canvas inline logic fixes
    content = content.replace("'rgba(255, 255, 255, 0.08)'", "isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'")
    content = content.replace("'rgba(255, 255, 255, 0.4)'", "isLight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'")
    
    content = content.replace("'#10162a'", "isLight ? '#e2e8f0' : '#10162a'")
    content = content.replace("'#0b0f19'", "isLight ? '#f1f5f9' : '#0b0f19'")
    
    # 2. JSX Styles object fixes (replacing with CSS vars)
    content = content.replace("'rgba(255,255,255,0.1)'", "'var(--border-color)'")
    content = content.replace("'rgba(255, 255, 255, 0.1)'", "'var(--progress-track)'")
    content = content.replace("'rgba(255,255,255,0.02)'", "'var(--progress-track)'")
    content = content.replace("'rgba(255,255,255,0.04)'", "'var(--border-color)'")
    content = content.replace("'rgba(255, 255, 255, 0.05)'", "'var(--border-color)'")
    
    # 3. Handle borders with regex
    content = re.sub(r"'1px solid rgba\(255,\s*255,\s*255,\s*0\.02\)'", "'1px solid var(--border-color)'", content)
    content = re.sub(r"'1px solid rgba\(255,\s*255,\s*255,\s*0\.05\)'", "'1px solid var(--border-color)'", content)
    content = re.sub(r"'1px solid rgba\(255,\s*255,\s*255,\s*0\.1\)'", "'1px solid var(--border-color)'", content)
    
    # 4. Handle textShadow manually for pink text glow in RandomForest3D
    content = content.replace("'0 0 10px rgba(255, 82, 140, 0.4)'", "'0 0 10px rgba(255, 82, 140, 0.2)'")
    
    if content != original:
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Updated {file_path}")

for f in files:
    process_file(f)
