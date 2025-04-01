// 날짜 포맷 함수 (YYYY-MM-DD)
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return '날짜 정보 없음'
    }
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\./g, '-').replace(/\s/g, '').slice(0, -1)
  } catch (error) {
    console.error('날짜 형식 변환 오류:', error)
    return '날짜 정보 없음'
  }
}

// 시간 포맷 함수 (HH:MM)
export const formatTime = (timeString) => {
  try {
    const date = new Date(timeString)
    if (isNaN(date.getTime())) {
      return '시간 정보 없음'
    }
    
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch (error) {
    console.error('시간 형식 변환 오류:', error)
    return '시간 정보 없음'
  }
}

// 날짜와 시간 결합 함수 (YYYY-MM-DD HH:MM)
export const formatDateTime = (dateTimeString) => {
  try {
    return `${formatDate(dateTimeString)} ${formatTime(dateTimeString)}`
  } catch (error) {
    console.error('날짜 시간 형식 변환 오류:', error)
    return '날짜 시간 정보 없음'
  }
}

// 현재 날짜를 YYYY-MM-DD 형식으로 반환
export const getCurrentDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// 현재 시간을 HH:MM 형식으로 반환
export const getCurrentTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  return `${hours}:${minutes}`
}

// 날짜 비교 함수 (date1이 date2보다 이후인지)
export const isDateAfter = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  
  return d1 > d2
}

// 날짜 더하기 함수 (days일 추가)
export const addDays = (dateString, days) => {
  const date = new Date(dateString)
  date.setDate(date.getDate() + days)
  
  return date
}

// ISO 형식 문자열로 변환 (YYYY-MM-DDTHH:MM:SS.sssZ)
export const toISOString = (dateString) => {
  const date = new Date(dateString)
  return date.toISOString()
} 