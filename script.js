// 유튜브 위젯 데이터 정의 (실제 사장님 유튜브 데이터로 쉽게 커스텀 가능)
const YOUTUBE_VIDEOS = [
  {
    id: "video1",
    title: "[꿈해몽] 돼지꿈 꿨다고 다 복권 사면 안 되는 이유! 진짜 대박 길몽 구별하는 법",
    thumbnail: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=640&auto=format&fit=crop", // 신비로운 분위기의 이미지
    url: "https://www.youtube.com", // 실제 링크로 교체 가능
    duration: "12:35",
    views: "1.2만회",
    date: "3일 전"
  },
  {
    id: "video2",
    title: "뱀이 나오는 꿈꿨다면 반드시 확인하세요! 종류별/상황별 소름 돋는 뱀 꿈 해석",
    thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=640&auto=format&fit=crop",
    url: "https://www.youtube.com",
    duration: "15:20",
    views: "8500회",
    date: "1주일 전"
  },
  {
    id: "video3",
    title: "절대 지나치면 안 되는 흉몽 5가지 경고! 내 몸과 운을 지키는 꿈해몽 법칙",
    thumbnail: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=640&auto=format&fit=crop",
    url: "https://www.youtube.com",
    duration: "9:45",
    views: "2.3만회",
    date: "2주일 전"
  }
];

// 한글 자음 분리 및 초성 매칭용 헬퍼 함수 (가이드라인 준수 고기능성 검색)
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
  const modal = document.getElementById("detailModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalBadge = document.getElementById("modalBadge");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const shareBtn = document.getElementById("shareBtn");
  const youtubeGrid = document.getElementById("youtubeGrid");

  let currentCategory = "전체";
  let activeDreamId = null;

  // 1. 유튜브 위젯 동적 로드
  function renderYoutubeWidgets() {
    youtubeGrid.innerHTML = YOUTUBE_VIDEOS.map(video => `
      <div class="video-card" onclick="window.open('${video.url}', '_blank')">
        <div class="thumbnail-wrap">
          <img src="${video.thumbnail}" alt="${video.title}">
          <div class="play-overlay">
            <span class="play-icon">▶</span>
          </div>
          <span class="duration-badge">${video.duration}</span>
        </div>
        <div class="video-info">
          <h3>${video.title}</h3>
          <div class="video-meta">
            조회수 ${video.views} • ${video.date}
          </div>
        </div>
      </div>
    `).join('');
  }

  // 2. 카테고리 칩 렌더링
  function renderCategoryChips() {
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

  // 3. 실시간 검색 및 결과 출력
  function filterAndRenderResults() {
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

    renderResults(filtered);
  }

  function renderResults(dreams) {
    if (dreams.length === 0) {
      resultsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
          <span style="font-size: 3rem; display: block; margin-bottom: 10px;">🔍</span>
          검색된 꿈해몽 정보가 없습니다. 다른 키워드로 검색해보세요!
        </div>
      `;
      return;
    }

    resultsGrid.innerHTML = dreams.map(dream => `
      <div class="result-card" onclick="openDetailModal(${dream.id})">
        <div>
          <div class="card-header">
            <span class="tag-badge">${dream.category}</span>
            <span class="type-badge ${dream.type}">${dream.type}</span>
          </div>
          <h3>${dream.title}</h3>
          <p>${dream.summary}</p>
        </div>
        <div class="card-footer">
          <span>상세 해석 보기</span>
          <span>→</span>
        </div>
      </div>
    `).join('');
  }

  // 4. 모달 상세 보기 로직
  window.openDetailModal = function(id) {
    const dream = DREAM_DATABASE.find(item => item.id === id);
    if (!dream) return;

    activeDreamId = id;
    modalTitle.innerText = dream.title;
    modalBadge.innerHTML = `
      <span class="tag-badge" style="margin-right: 8px;">${dream.category}</span>
      <span class="type-badge ${dream.type}">${dream.type}</span>
    `;
    modalBody.innerHTML = dream.interpretation;
    modal.classList.add("active");
    document.body.style.overflow = "hidden"; // 배경 스크롤 차단
  };

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    activeDreamId = null;
  }

  // 5. 공유 기능 (URL 또는 텍스트 복사)
  shareBtn.addEventListener("click", () => {
    const dream = DREAM_DATABASE.find(item => item.id === activeDreamId);
    if (!dream) return;

    const dummyText = `[자유로운 꿈해몽] "${dream.title}" 해몽 정보:\n${dream.summary}\n\n자세히 보기: ${window.location.href}`;
    navigator.clipboard.writeText(dummyText).then(() => {
      alert("꿈해몽 정보가 클립보드에 복사되었습니다! SNS나 카카오톡에 공유해보세요.");
    }).catch(err => {
      console.error("복사 실패:", err);
    });
  });

  // 이벤트 바인딩
  searchInput.addEventListener("input", filterAndRenderResults);
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    filterAndRenderResults();
    searchInput.focus();
  });

  closeModalBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // ESC 키 클릭시 모달 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // 초기 렌더링
  renderYoutubeWidgets();
  renderCategoryChips();
  filterAndRenderResults();
});
