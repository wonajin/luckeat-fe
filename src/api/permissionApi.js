import apiClient from './apiClient'

// 권한 부여
export const grantPermission = async (permissionData) => {
  try {
    const response = await apiClient.post('/v1/permissions', permissionData)
    return response.data
  } catch (error) {
    throw error
  }
}

// 권한 목록 조회
export const getPermissions = async () => {
  try {
    const response = await apiClient.get('/v1/permissions')
    return response.data
  } catch (error) {
    throw error
  }
}

// 특정 권한 조회
export const getPermissionById = async (permissionId) => {
  try {
    const response = await apiClient.get(`/v1/permissions/${permissionId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// 권한 삭제
export const deletePermission = async (permissionId) => {
  try {
    const response = await apiClient.delete(`/v1/permissions/${permissionId}`)
    return response.data
  } catch (error) {
    throw error
  }
}
