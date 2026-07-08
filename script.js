// 유튜브 위젯 데이터 정의 (실제 유튜브 썸네일 주소 및 동영상 링크 매핑)
const YOUTUBE_VIDEOS = [
  {
    id: "video1",
    title: "피나는 꿈 해몽 | 온몸이 피투성이가 되는 꿈을 꿨다면 절대 씻지 마세요!",
    thumbnail: "https://img.youtube.com/vi/eHGJJnRtZP8/hqdefault.jpg", 
    url: "https://youtu.be/eHGJJnRtZP8"
  },
  {
    id: "video2",
    title: "무의식이 보내는 가장 강력한 경고! 절대 조심해야 할 흉몽과 예지몽 5가지",
    thumbnail: "https://img.youtube.com/vi/7oCSOsiMbv8/hqdefault.jpg",
    url: "https://youtu.be/7oCSOsiMbv8"
  },
  {
    id: "video3",
    title: "[꿈해몽] 로또 당첨을 상징하는 조상 꿈의 비밀! 조상님이 나타나 돈을 준다면?",
    thumbnail: "https://img.youtube.com/vi/ZdLRaE0fHEM/hqdefault.jpg",
    url: "https://youtu.be/ZdLRaE0fHEM"
  }
];

// 한글 자음 분리 및 초성 매칭용 헬퍼 함수
function getChosung(str) {
  const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if (code > -1 && code < 11172) {
      result += cho[Math.floor(code / 588)];
    } else {
      result += str.charAt(i);
    }
  }
  return result;
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearBtn");
  const categoryContainer = document.getElementById("categoryContainer");
  const resultsGrid = document.getElementById("resultsGrid");
  const blogGrid = document.getElementById("blogGrid");
  const youtubeGrid = document.getElementById("youtubeGrid");

  let currentCategory = "전체";

  // 1. 유튜브 위젯 동적 로드
  function renderYoutubeWidgets() {
    if (!youtubeGrid) return;
    youtubeGrid.innerHTML = YOUTUBE_VIDEOS.map(video => `
      <div class="video-card" onclick="window.open('${video.url}', '_blank')">
        <div class="thumbnail-wrap">
          <img src="${video.thumbnail}" alt="${video.title}">
          <div class="play-overlay">
            <span class="play-icon">▶</span>
          </div>
        </div>
        <div class="video-info">
          <h3>${video.title}</h3>
        </div>
      </div>
    `).join('');
  }

  // 2. 카테고리 칩 렌더링
  function renderCategoryChips() {
    if (!categoryContainer) return;
    categoryContainer.innerHTML = DREAM_CATEGORIES.map(category => `
      <button class="category-chip ${category === currentCategory ? 'active' : ''}" data-category="${category}">
        ${category}
      </button>
    `).join('');

    // 카테고리 클릭 이벤트
    document.querySelectorAll(".category-chip").forEach(button => {
      button.addEventListener("click", (e) => {
        currentCategory = e.target.getAttribute("data-category");
        
        // 버튼 활성화 클래스 조절
        document.querySelectorAll(".category-chip").forEach(btn => btn.classList.remove("active"));
        e.target.classList.add("active");

        // 필터링 적용
        filterAndRenderResults();
      });
    });
  }

  // 3. 실시간 꿈해몽 검색 결과 출력
  function filterAndRenderResults() {
    if (!resultsGrid) return;
    const query = searchInput.value.trim().toLowerCase();
    const queryChosung = getChosung(query);

    // 검색어 비우기 버튼 노출 조절
    clearBtn.style.display = query.length > 0 ? "block" : "none";

    const filtered = DREAM_DATABASE.filter(dream => {
      // 카테고리 필터
      if (currentCategory !== "전체" && dream.category !== currentCategory) {
        return false;
      }

      // 검색어 필터 (초성 일치 또는 텍스트 포함)
      if (query.length > 0) {
        const titleLower = dream.title.toLowerCase();
        const titleChosung = getChosung(titleLower);
        const keywordLower = dream.keyword.toLowerCase();
        const tagMatch = dream.tags.some(tag => tag.toLowerCase().includes(query) || getChosung(tag.toLowerCase()).includes(queryChosung));

        const isTitleMatch = titleLower.includes(query) || titleChosung.includes(queryChosung);
        const isKeywordMatch = keywordLower.includes(query);

        return isTitleMatch || isKeywordMatch || tagMatch;
      }

      return true;
    });

    renderResults(filtered, query);
  }

  function renderResults(dreams, query) {
    if (!resultsGrid) return;
    
    // 검색어가 입력되었는데 매칭 결과가 없을 때 (AI 추천 화면 렌더링)
    if (dreams.length === 0 && query && query.length > 0) {
      resultsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; background: rgba(157, 78, 221, 0.05); border: 1px dashed var(--primary-color); border-radius: 20px;">
          <span style="font-size: 3.5rem; display: block; margin-bottom: 15px;">🤖</span>
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 8px;">사전에 "${query}"에 대한 정확한 해몽이 없습니다</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px; max-width: 500px; margin-left: auto; margin-right: auto;">
            하지만 걱정하지 마세요! 실시간 인공지능 AI 꿈해몽 비서에게 물어보고 즉시 정밀한 풀이를 받아볼 수 있습니다.
          </p>
          <a href="ai/?q=${encodeURIComponent(query)}" class="btn-share" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
            🌙 AI 실시간 정밀 해몽 받기
          </a>
        </div>
      `;
      return;
    }
    
    // 검색어가 비어있을 때는 디폴트 가이드라인
    if (dreams.length === 0) {
      resultsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
          <span style="font-size: 3rem; display: block; margin-bottom: 10px;">🔍</span>
          선택한 카테고리에 맞는 꿈을 검색하거나 카테고리 필터를 변경해 보세요!
        </div>
      `;
      return;
    }

    resultsGrid.innerHTML = dreams.map(dream => `
      <div class="result-card" onclick="location.href='detail/?id=${dream.id}'">
        <div>
          <div class="card-header">
            <span class="tag-badge">${dream.category}</span>
            <span class="type-badge ${dream.type}">${dream.type}</span>
          </div>
          <h3>${dream.title}</h3>
          <p>${dream.summary}</p>
        </div>
        <div class="card-footer">
          <span>상세 해석 읽기</span>
          <span>→</span>
        </div>
      </div>
    `).join('');
  }

  // 4. 블로그 글 목록 렌더링
  function renderBlogPosts() {
    if (!blogGrid) return;
    blogGrid.innerHTML = BLOG_DATABASE.map(post => `
      <div class="blog-card" onclick="location.href='detail/?post=${post.id}'">
        <div>
          <div class="blog-card-header">
            <span class="tag-badge" style="background: rgba(76, 201, 240, 0.1); color: var(--accent-color);">${post.category}</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${post.date}</span>
          </div>
          <h3>${post.title}</h3>
          <p>${post.summary}</p>
        </div>
        <div class="card-footer">
          <span>블로그 글 읽기</span>
          <span>→</span>
        </div>
      </div>
    `).join('');
  }

  // 이벤트 바인딩
  if (searchInput) {
    searchInput.addEventListener("input", filterAndRenderResults);
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      filterAndRenderResults();
      searchInput.focus();
    });
  }

  // 초기 렌더링
  renderYoutubeWidgets();
  renderCategoryChips();
  filterAndRenderResults();
  renderBlogPosts();
});
