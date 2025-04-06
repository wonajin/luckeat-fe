import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material'
import { getAllProducts } from '../../api/productApi'
import { getAllStores } from '../../api/storeApi'

const ProductSection = ({ selectedCategory, categories }) => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 상품과 가게 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 상품 데이터 가져오기
        const productResponse = await getAllProducts()
        

        if (productResponse.success) {
          setProducts(productResponse.data || [])
        } else {
          setError('상품 데이터를 가져오는데 실패했습니다.')
        }

        // 가게 데이터 가져오기 (카테고리 필터링을 위해 필요)
        const storeResponse = await getAllStores()
        

        if (storeResponse.success) {
          setStores(storeResponse.data || [])
        }

        setLoading(false)
      } catch (error) {
        
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 선택된 카테고리에 따라 상품 필터링
  const filteredProducts = selectedCategory
    ? products.filter((product) => {
        const store = stores.find((s) => s.id === product.storeId)
        return store && store.categoryId === selectedCategory
      })
    : products

  // 상품 카드 클릭 시 상세 페이지로 이동
  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`)
  }

  // 현재 선택된 카테고리 이름 가져오기
  const getCategoryName = () => {
    if (!selectedCategory || !categories) return ''
    const category = categories.find((c) => c.id === selectedCategory)
    return category ? category.categoryName : ''
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
        {selectedCategory ? `${getCategoryName()} 카테고리 상품` : '추천 상품'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {loading ? (
          <Box display="flex" justifyContent="center" width="100%" my={4}>
            <CircularProgress />
          </Box>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                onClick={() => handleProductClick(product.id)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={
                    product.productImg ||
                    'https://via.placeholder.com/300x180?text=No+Image'
                  }
                  alt={product.productName}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {product.productName}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {product.originalPrice
                        ? product.originalPrice.toLocaleString()
                        : 0}
                      원
                    </Typography>
                    {product.discountedPrice &&
                      product.originalPrice &&
                      product.discountedPrice < product.originalPrice && (
                        <Chip
                          label={`${Math.round((1 - product.discountedPrice / product.originalPrice) * 100)}% 할인`}
                          size="small"
                          color="error"
                        />
                      )}
                  </Box>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {product.discountedPrice
                      ? product.discountedPrice.toLocaleString()
                      : product.originalPrice
                        ? product.originalPrice.toLocaleString()
                        : 0}
                    원
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Box sx={{ p: 2, color: 'text.secondary', width: '100%' }}>
            {selectedCategory
              ? '해당 카테고리의 상품이 없습니다.'
              : '상품 정보가 없습니다.'}
          </Box>
        )}
      </Grid>
    </Box>
  )
}

export default ProductSection
