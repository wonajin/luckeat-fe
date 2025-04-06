import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material'
import { getCategories } from '../../api/categoryApi'

const CategorySection = ({ onSelectCategory, selectedCategory }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 카테고리 데이터 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await getCategories()
        console.log('카테고리 API 응답:', response)

        if (response.success) {
          setCategories(response.data || [])
        } else {
          setError('카테고리 데이터를 가져오는데 실패했습니다.')
        }
        setLoading(false)
      } catch (error) {
        console.error('카테고리 데이터 오류:', error)
        setError('카테고리 데이터를 불러오는 중 오류가 발생했습니다.')
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
        카테고리
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" width="100%" my={4}>
            <CircularProgress />
          </Box>
        ) : categories && categories.length > 0 ? (
          categories.map((category) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={category.id}>
              <Card
                onClick={() =>
                  onSelectCategory(
                    category.id === selectedCategory ? null : category.id,
                  )
                }
                sx={{
                  height: 100,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                  bgcolor:
                    selectedCategory === category.id
                      ? 'rgba(255, 193, 7, 0.1)'
                      : 'white',
                }}
              >
                <CardContent>
                  <Typography align="center" fontWeight="medium">
                    {category.categoryName}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Box sx={{ p: 2, color: 'text.secondary' }}>
            카테고리 정보가 없습니다.
          </Box>
        )}
      </Grid>
    </Box>
  )
}

export default CategorySection
