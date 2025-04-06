import { useState, useEffect, useRef } from 'react';
import { getStores } from '../../api/storeApi';
import { debounce } from 'lodash';
import { API_BASE_URL } from '../../config/apiConfig';

function SearchBar({ 
  placeholder = '가게이름 검색',
  onSearch,
  initialValue = '',
}) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchContainerRef = useRef(null);
  const MAX_SEARCH_LENGTH = 20; // 최대 입력 글자수 제한

  // 검색어 입력에 따른 추천 가게 필터링 (디바운싱 적용)
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        // 백엔드 API를 이용한 검색 자동완성
        const params = {
          storeName: query,
          size: 5 // 최대 5개까지만 표시
        };
        
        const result = await getStores(params);
        const stores = result.data || [];
        
        setSuggestions(stores);
      } catch (error) {
        console.error('검색 자동완성 오류:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300)
  ).current;

  // 입력값이 변경될 때마다 추천 검색어 필터링
  useEffect(() => {
    debouncedSearch(searchQuery);
    
    // 컴포넌트 언마운트 시 디바운스 취소
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

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
      onSearch(searchQuery);
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
      
      // 입력할 때마다 검색 실행 (즉시 검색 결과 반영)
      if (onSearch) {
        onSearch(input);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (!suggestion) {
      return;
    }
    
    const storeName = suggestion.storeName || suggestion.name || '';
    if (!storeName) {
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
                key={store.id || store.storeId || index}
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
      
      {/* 로딩 인디케이터 */}
      {isLoading && searchQuery.trim() && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      )}
    </div>
  );
}

export default SearchBar; 