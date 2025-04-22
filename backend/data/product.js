// product.js:

const products = [
    {
        name: "Sản phẩm 1",
        description: "Phù hợp cho cả đi làm và đi chơi.",
        price: 7371450,
        discountPrice: 7248607,
        countInStock: 5,
        sku: "SKU-001",
        category: "Thời trang",
        brand: "Routine",
        sizes: ["M", "XXL", "XL", "S", "L"],
        colors: ["Vàng"],
        collections: "Năng động",
        material: "Jean",
        gender: "Nữ",
        images: [
          { url: "https://picsum.photos/500/500?random=1", altText: "Hình ảnh mặt trước của Sản phẩm 1" },
          { url: "https://picsum.photos/500/500?random=2", altText: "Hình ảnh mặt sau của Sản phẩm 1" }
        ],
        rating: 4.4,
        numReviews: 42
      },
      {
        name: "Sản phẩm 2",
        description: "Màu sắc trẻ trung, form dáng chuẩn.",
        price: 2142570,
        discountPrice: 2124332,
        countInStock: 83,
        sku: "SKU-002",
        category: "Thời trang",
        brand: "Coolmate",
        sizes: ["M", "L"],
        colors: ["Xanh dương", "Đen"],
        collections: "Tối giản",
        material: "Cotton",
        gender: "Nam",
        images: [
          { url: "https://picsum.photos/500/500?random=3", altText: "Hình ảnh mặt trước của Sản phẩm 2" },
          { url: "https://picsum.photos/500/500?random=4", altText: "Hình ảnh mặt sau của Sản phẩm 2" }
        ],
        rating: 4.6,
        numReviews: 58
      },
      {
        name: "Sản phẩm 3",
        description: "Thiết kế hiện đại, dễ phối đồ.",
        price: 1342990,
        discountPrice: 1213723,
        countInStock: 33,
        sku: "SKU-003",
        category: "Thời trang",
        brand: "CELEB Store",
        sizes: ["S", "L"],
        colors: ["Đen", "Trắng"],
        collections: "Đường phố",
        material: "Polyester",
        gender: "Nữ",
        images: [
          { url: "https://picsum.photos/500/500?random=5", altText: "Hình ảnh mặt trước của Sản phẩm 3" },
          { url: "https://picsum.photos/500/500?random=6", altText: "Hình ảnh mặt sau của Sản phẩm 3" }
        ],
        rating: 4.2,
        numReviews: 23
      },
      {
        name: "Sản phẩm 4",
        description: "Chất liệu cao cấp, thoải mái cả ngày dài.",
        price: 5631255,
        discountPrice: 4800000,
        countInStock: 65,
        sku: "SKU-004",
        category: "Thời trang",
        brand: "YODY",
        sizes: ["XL", "XXL"],
        colors: ["Xám"],
        collections: "Công sở",
        material: "Cotton",
        gender: "Nam",
        images: [
          { url: "https://picsum.photos/500/500?random=7", altText: "Hình ảnh mặt trước của Sản phẩm 4" },
          { url: "https://picsum.photos/500/500?random=8", altText: "Hình ảnh mặt sau của Sản phẩm 4" }
        ],
        rating: 4.9,
        numReviews: 87
      },
      {
        name: "Sản phẩm 5",
        description: "Kiểu dáng năng động, phù hợp nhiều hoàn cảnh.",
        price: 980000,
        discountPrice: 860000,
        countInStock: 19,
        sku: "SKU-005",
        category: "Thời trang",
        brand: "Hades Studio",
        sizes: ["M", "L", "XL"],
        colors: ["Đỏ", "Xanh lá", "Be"],
        collections: "Dạo phố",
        material: "Nỉ",
        gender: "Nữ",
        images: [
          { url: "https://picsum.photos/500/500?random=9", altText: "Hình ảnh mặt trước của Sản phẩm 5" },
          { url: "https://picsum.photos/500/500?random=10", altText: "Hình ảnh mặt sau của Sản phẩm 5" }
        ],
        rating: 4.7,
        numReviews: 64
      },
      {
        name: "Sản phẩm 6",
        description: "Sản phẩm được ưa chuộng bởi giới trẻ.",
        price: 4730000,
        discountPrice: 4450000,
        countInStock: 22,
        sku: "SKU-006",
        category: "Thời trang",
        brand: "Canifa",
        sizes: ["S", "M", "XL"],
        colors: ["Xanh dương", "Be"],
        collections: "Tối giản",
        material: "Cotton",
        gender: "Nam",
        images: [
          { url: "https://picsum.photos/500/500?random=11", altText: "Hình ảnh mặt trước của Sản phẩm 6" },
          { url: "https://picsum.photos/500/500?random=12", altText: "Hình ảnh mặt sau của Sản phẩm 6" }
        ],
        rating: 4.3,
        numReviews: 35
      },
      {
        name: "Sản phẩm 7",
        description: "Màu sắc trẻ trung, form dáng chuẩn.",
        price: 880000,
        discountPrice: 790000,
        countInStock: 44,
        sku: "SKU-007",
        category: "Thời trang",
        brand: "SIXDO",
        sizes: ["M", "L"],
        colors: ["Đỏ"],
        collections: "Dạo phố",
        material: "Linen",
        gender: "Nữ",
        images: [
          { url: "https://picsum.photos/500/500?random=13", altText: "Hình ảnh mặt trước của Sản phẩm 7" },
          { url: "https://picsum.photos/500/500?random=14", altText: "Hình ảnh mặt sau của Sản phẩm 7" }
        ],
        rating: 4.5,
        numReviews: 26
      },
      {
        name: "Sản phẩm 8",
        description: "Chất liệu cao cấp, thoải mái cả ngày dài.",
        price: 3250000,
        discountPrice: 3000000,
        countInStock: 32,
        sku: "SKU-008",
        category: "Thời trang",
        brand: "CELEB Store",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Trắng", "Đen"],
        collections: "Đường phố",
        material: "Polyester",
        gender: "Nam",
        images: [
          { url: "https://picsum.photos/500/500?random=15", altText: "Hình ảnh mặt trước của Sản phẩm 8" },
          { url: "https://picsum.photos/500/500?random=16", altText: "Hình ảnh mặt sau của Sản phẩm 8" }
        ],
        rating: 4.1,
        numReviews: 18
      },
      {
        name: "Sản phẩm 9",
        description: "Thiết kế hiện đại, dễ phối đồ.",
        price: 2430000,
        discountPrice: 2180000,
        countInStock: 12,
        sku: "SKU-009",
        category: "Thời trang",
        brand: "TheBlueTshirt",
        sizes: ["M", "L", "XXL"],
        colors: ["Xám"],
        collections: "Thể thao",
        material: "Thun",
        gender: "Nam",
        images: [
          { url: "https://picsum.photos/500/500?random=17", altText: "Hình ảnh mặt trước của Sản phẩm 9" },
          { url: "https://picsum.photos/500/500?random=18", altText: "Hình ảnh mặt sau của Sản phẩm 9" }
        ],
        rating: 4.6,
        numReviews: 40
      },
      {
        name: "Sản phẩm 10",
        description: "Sản phẩm được ưa chuộng bởi giới trẻ.",
        price: 1100000,
        discountPrice: 990000,
        countInStock: 17,
        sku: "SKU-010",
        category: "Thời trang",
        brand: "YODY",
        sizes: ["S", "M"],
        colors: ["Xanh lá", "Đen"],
        collections: "Công sở",
        material: "Cotton",
        gender: "Nữ",
        images: [
          { url: "https://picsum.photos/500/500?random=19", altText: "Hình ảnh mặt trước của Sản phẩm 10" },
          { url: "https://picsum.photos/500/500?random=20", altText: "Hình ảnh mặt sau của Sản phẩm 10" }
        ],
        rating: 4.4,
        numReviews: 51
      },
      {
        name: "Sản phẩm 11",
        description: "Phù hợp cho cả đi làm và đi chơi.",
        price: 3540000,
        discountPrice: 3350000,
        countInStock: 27,
        sku: "SKU-011",
        category: "Thời trang",
        brand: "Coolmate",
        sizes: ["M", "XL", "XXL"],
        colors: ["Be", "Trắng"],
        collections: "Công sở",
        material: "Cotton",
        gender: "Nam",
        images: [
          { url: "https://picsum.photos/500/500?random=21", altText: "Hình ảnh mặt trước của Sản phẩm 11" },
          { url: "https://picsum.photos/500/500?random=22", altText: "Hình ảnh mặt sau của Sản phẩm 11" }
        ],
        rating: 4.3,
        numReviews: 36
      },
      {
        name: "Sản phẩm 12",
        description: "Kiểu dáng năng động, phù hợp nhiều hoàn cảnh.",
        price: 1900000,
        discountPrice: 1700000,
        countInStock: 38,
        sku: "SKU-012",
        category: "Thời trang",
        brand: "Hades Studio",
        sizes: ["S", "M", "L"],
        colors: ["Đỏ", "Xanh dương"],
        collections: "Năng động",
        material: "Nỉ",
        gender: "Nữ",
        images: [
          { url: "https://picsum.photos/500/500?random=23", altText: "Hình ảnh mặt trước của Sản phẩm 12" },
          { url: "https://picsum.photos/500/500?random=24", altText: "Hình ảnh mặt sau của Sản phẩm 12" }
        ],
        rating: 4.7,
        numReviews: 21
      },
      {
        name: "Sản phẩm 13",
        description: "Thiết kế hiện đại, dễ phối đồ.",
        price: 2690000,
        discountPrice: 2550000,
        countInStock: 60,
        sku: "SKU-013",
        category: "Thời trang",
        brand: "Routine",
        sizes: ["L", "XL"],
        colors: ["Xám", "Xanh lá"],
        collections: "Đường phố",
        material: "Linen",
        gender: "Nam",
        images: [
          { url: "https://picsum.photos/500/500?random=25", altText: "Hình ảnh mặt trước của Sản phẩm 13" },
          { url: "https://picsum.photos/500/500?random=26", altText: "Hình ảnh mặt sau của Sản phẩm 13" }
        ],
        rating: 4.0,
        numReviews: 14
      },
      {
        name: "Sản phẩm 14",
        description: "Sản phẩm được ưa chuộng bởi giới trẻ.",
        price: 4650000,
        discountPrice: 4500000,
        countInStock: 40,
        sku: "SKU-014",
        category: "Thời trang",
        brand: "TheBlueTshirt",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Vàng", "Trắng"],
        collections: "Tối giản",
        material: "Thun",
        gender: "Nam",
        images: [
          { url: "https://picsum.photos/500/500?random=27", altText: "Hình ảnh mặt trước của Sản phẩm 14" },
          { url: "https://picsum.photos/500/500?random=28", altText: "Hình ảnh mặt sau của Sản phẩm 14" }
        ],
        rating: 4.5,
        numReviews: 48
      },
      {
        name: "Sản phẩm 15",
        description: "Chất liệu cao cấp, thoải mái cả ngày dài.",
        price: 1200000,
        discountPrice: 1100000,
        countInStock: 25,
        sku: "SKU-015",
        category: "Thời trang",
        brand: "SIXDO",
        sizes: ["M", "L"],
        colors: ["Xanh lá"],
        collections: "Công sở",
        material: "Polyester",
        gender: "Nữ",
        images: [
          { url: "https://picsum.photos/500/500?random=29", altText: "Hình ảnh mặt trước của Sản phẩm 15" },
          { url: "https://picsum.photos/500/500?random=30", altText: "Hình ảnh mặt sau của Sản phẩm 15" }
        ],
        rating: 4.6,
        numReviews: 32
      },
      
  ];
  
 module.exports = products;