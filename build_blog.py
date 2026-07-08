import glob
import os
import re
import json

def compile_blog_posts():
    posts_dir = "blog_posts"
    data_file = "data.js"
    
    if not os.path.exists(posts_dir):
        print(f"Error: {posts_dir} directory not found.")
        return
        
    post_files = sorted(glob.glob(os.path.join(posts_dir, "*.txt")) + glob.glob(os.path.join(posts_dir, "*.md")))
    
    blog_database = []
    post_id = 1
    
    for file_path in post_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                raw_content = f.read()
                
            if "---" not in raw_content:
                print(f"Warning: Skipping {file_path} because it doesn't contain the '---' divider.")
                continue
                
            header_part, content_part = raw_content.split("---", 1)
            
            # 메타데이터 파싱
            metadata = {}
            for line in header_part.strip().split("\n"):
                if ":" in line:
                    key, val = line.split(":", 1)
                    metadata[key.strip()] = val.strip()
            
            # 본문 라인별 HTML 변환 (스마트 파서)
            lines = content_part.strip().split("\n")
            html_content = ""
            current_paragraph = []
            
            for line in lines:
                line_stripped = line.strip()
                if line_stripped.startswith("### "):
                    # 이전에 누적된 문단 출력
                    if current_paragraph:
                        p_text = " ".join(current_paragraph)  # 줄바꿈은 띄어쓰기로 연결해 자연스러운 문장 생성
                        html_content += f"      <p>{p_text}</p>\n"
                        current_paragraph = []
                    # 소제목 생성
                    html_content += f"      <h3>{line_stripped[4:]}</h3>\n"
                elif not line_stripped:
                    # 빈 줄은 문단 마침
                    if current_paragraph:
                        p_text = " ".join(current_paragraph)
                        html_content += f"      <p>{p_text}</p>\n"
                        current_paragraph = []
                else:
                    current_paragraph.append(line_stripped)
            
            # 마지막 남은 문단 추가
            if current_paragraph:
                p_text = " ".join(current_paragraph)
                html_content += f"      <p>{p_text}</p>\n"
            
            post_obj = {
                "id": post_id,
                "title": metadata.get("제목", "제목 없음"),
                "summary": metadata.get("요약", "요약 없음"),
                "date": metadata.get("날짜", "2026.07.08"),
                "category": metadata.get("카테고리", "일반"),
                "author": metadata.get("작성자", "운영자"),
                "content": f"\n{html_content}    "
            }
            
            blog_database.append(post_obj)
            post_id += 1
            print(f"Compiled: {metadata.get('제목', file_path)}")
            
        except Exception as e:
            print(f"Error compiling {file_path}: {e}")
            
    if not blog_database:
        print("No valid blog posts found to compile.")
        return
        
    # data.js 파일 로드 및 BLOG_DATABASE 교체
    if not os.path.exists(data_file):
        print(f"Error: {data_file} not found in workspace.")
        return
        
    with open(data_file, "r", encoding="utf-8") as f:
        data_content = f.read()
        
    # JSON 직렬화 및 JS 포맷팅
    blog_db_js = json.dumps(blog_database, ensure_ascii=False, indent=2)
    replacement_text = f"// 블로그 포스트 데이터베이스 (독창적 가치를 보강하는 긴 글 자료)\nconst BLOG_DATABASE = {blog_db_js};\n\n"
    
    # 정규식으로 const BLOG_DATABASE = [ ... ]; 패턴 교체
    pattern = r"// 블로그 포스트 데이터베이스 \(독창적 가치를 보강하는 긴 글 자료\)\s*const BLOG_DATABASE = \[.*?\];\s*(?=\/\/ 카테고리 종류 정의)"
    
    if re.search(pattern, data_content, re.DOTALL):
        updated_data_content = re.sub(pattern, replacement_text, data_content, flags=re.DOTALL)
    else:
        # 수동 찾기
        start_idx = data_content.find("// 블로그 포스트 데이터베이스")
        end_idx = data_content.find("// 카테고리 종류 정의")
        if start_idx != -1 and end_idx != -1:
            updated_data_content = data_content[:start_idx] + replacement_text + data_content[end_idx:]
        else:
            print("Error: Could not locate BLOG_DATABASE section in data.js")
            return
            
    with open(data_file, "w", encoding="utf-8") as f:
        f.write(updated_data_content)
        
    print(f"Successfully updated {data_file} with {len(blog_database)} blog posts!")

if __name__ == "__main__":
    compile_blog_posts()
