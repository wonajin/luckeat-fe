import { useState, useEffect, useRef } from 'react';
import { getStores } from '../../api/storeApi';
import { debounce } from 'lodash';

function SearchBar({ 
  placeholder = '가게이름 검색',
  onSearch,
  initialValue = '',
}) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [stores, setStores] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchContainerRef = useRef(null);
  const MAX_SEARCH_LENGTH = 20; // 최대 입력 글자수 제한

  // 컴포넌트 마운트 시 가게 데이터 로드
  useEffect(() => {
    const loadStores = async () => {
      try {
        setIsLoading(true);
        // Mock 데이터 생성 (실제 API가 불안정하므로)
        const mockStores = [
          { id: 1, storeName: '맛있는 한식당', categoryId: 1, category: '한식' },
          { id: 2, storeName: '일식 스시', categoryId: 2, category: '일식' },
          { id: 3, storeName: '중화요리', categoryId: 3, category: '중식' },
          { id: 4, storeName: '양식 파스타', categoryId: 4, category: '양식' },
          { id: 5, storeName: '카페 베이커리', categoryId: 5, category: '카페/베이커리' },
          { id: 6, storeName: '샐러드 가게', categoryId: 6, category: '샐러드/청과' },
        ];
        
        setStores(mockStores);
        console.log('가게 데이터 로드 완료 (Mock)', mockStores.length);
      } catch (error) {
        console.error('가게 데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStores();
  }, []);

  // 검색어 입력에 따른 추천 가게 필터링 (디바운싱 적용)
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        console.log('검색어 필터링 시작:', query);
        
        // 로컬에서 필터링 (Mock 데이터 사용)
        const filtered = stores
          .filter((store) => {
            const storeName = store.storeName || store.name || '';
            return storeName.toLowerCase().includes(query.toLowerCase());
          })
          .slice(0, 5); // 최대 5개까지만 표시
        
        console.log('필터링 결과:', filtered.length, '개 항목');
        setSuggestions(filtered);
      } catch (error) {
        console.error('가게 검색 중 오류:', error);
        setIsLoading(false);
      }
    }, 300),
  ).current;

  // 입력값이 변경될 때마다 추천 검색어 필터링
  useEffect(() => {
    debouncedSearch(searchQuery);
    
    // 컴포넌트 언마운트 시 디바운스 취소
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch, stores]);

  // 외부 클릭 감지 (추천 검색어 창 닫기)
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    if (onSearch && searchQuery.trim()) {
      console.log('SearchBar: 검색 실행 시도 - 검색어:', searchQuery);
      onSearch(searchQuery);
      console.log('SearchBar: onSearch 함수 호출 완료');
      setShowSuggestions(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    // 최대 글자 수 제한 적용
    const input = e.target.value;
    if (input.length <= MAX_SEARCH_LENGTH) {
      setSearchQuery(input);
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (!suggestion) {
      console.error('잘못된 가게 데이터:', suggestion);
      return;
    }
    
    const storeName = suggestion.storeName || suggestion.name || '';
    if (!storeName) {
      console.error('가게 이름이 없습니다:', suggestion);
      return;
    }
    
    // 최대 글자 수 제한 적용
    const truncatedName = storeName.length > MAX_SEARCH_LENGTH 
      ? storeName.substring(0, MAX_SEARCH_LENGTH) 
      : storeName;
      
    setSearchQuery(truncatedName);
    
    // 검색 즉시 실행
    onSearch(truncatedName);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={searchContainerRef}>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full py-2 px-4 pr-10 border border-gray-300 rounded-full"
        value={searchQuery}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onFocus={() => setShowSuggestions(true)}
        maxLength={MAX_SEARCH_LENGTH}
      />
      <button 
        className="absolute right-3 top-1/2 transform -translate-y-1/2"
        onClick={handleSearch}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
      
      {/* 추천 가게 이름 표시 영역 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul>
            {suggestions.map((store, index) => (
              <li 
                key={store.id || index}
                className="px-4 py-2 hover:bg-yellow-50 cursor-pointer border-b border-gray-100 last:border-0"
                onClick={() => handleSuggestionClick(store)}
              >
                <div className="flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-gray-400 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"
                    />
                  </svg>
                  <span>{store.storeName || store.name || '이름 없음'}</span>
                  {(store.categoryName || store.category) && (
                    <span className="ml-2 text-xs text-gray-500">
                      {store.categoryName || store.category}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchBar; 