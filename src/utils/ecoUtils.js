/**
 * 환경 지표 계산을 위한 유틸리티 함수
 */

/**
 * 주문 수량에 따라 절약한 CO2를 계산합니다. (kg 단위)
 * 1 주문당 약 0.5kg의 CO2가 절약된다고 가정 (음식물 쓰레기 감소로 인한 이산화탄소 감소)
 * 
 * @param {number} orderCount - 주문 수
 * @returns {number} 절약한 CO2 양(kg)
 */
export const calculateSavedCO2 = (orderCount) => {
  // 1주문당 0.5kg의 CO2 절약 가정
  return (orderCount * 0.5).toFixed(1);
};

/**
 * 절약한 CO2 양에 따라 심은 나무 그루 수를 계산합니다.
 * 성인 나무 1그루는 연간 약 20kg의 CO2를 흡수한다고 가정
 * 
 * @param {number} savedCO2 - 절약한 CO2 양(kg)
 * @returns {number} 심은 나무 그루 수
 */
export const calculatePlantedTrees = (savedCO2) => {
  // 나무 1그루는 연간 20kg의 CO2를 흡수한다고 가정
  // 우리가 그만큼의 CO2를 절약했으므로, 그에 해당하는 나무를 심은 것과 같은 효과
  // 20kg당 1그루로 계산하고 소수점 첫째 자리까지 표시
  return (savedCO2 / 20).toFixed(1);
};

/**
 * 원가와 할인가를 기반으로 아낀 금액을 계산합니다.
 * 
 * @param {Array} orders - 주문 목록 ([{originalPrice, discountPrice, quantity}, ...])
 * @returns {number} 총 절약 금액
 */
export const calculateSavedMoney = (orders) => {
  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return 0;
  }

  return orders.reduce((total, order) => {
    const originalPrice = order.originalPrice || 0;
    const discountPrice = order.discountPrice || 0;
    const quantity = order.quantity || 1;
    
    // 주문당 절약 금액 = (원가 - 할인가) * 수량
    const savedPerOrder = (originalPrice - discountPrice) * quantity;
    return total + savedPerOrder;
  }, 0);
};

/**
 * 화폐 형식으로 표시합니다.
 * 
 * @param {number} amount - 금액
 * @returns {string} 화폐 형식으로 변환된 문자열
 */
export const formatCurrency = (amount) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}; 