# Kế hoạch hoàn thiện CRUD - Sản phẩm, Vaccin, Gói Vaccin

## Mục tiêu
Hoàn thiện đầy đủ chức năng CRUD (Create, Read, Update, Delete) cho:
- Sản phẩm (Products)
- Vaccin (Vaccines)
- Gói Vaccin (Vaccine Packages)

Bao gồm cả 3 tầng: **Frontend**, **Backend**, và **Database**

---

## 1. DATABASE (MySQL)

### 1.1. Kiểm tra và hoàn thiện schema

#### Tables hiện có:
- ✅ `SAN_PHAM` - Bảng sản phẩm
- ✅ `VAC_XIN` - Bảng vaccin
- ✅ `GOI_TIEM` - Bảng gói tiêm
- ✅ `SOMUITIEM` - Bảng quan hệ nhiều-nhiều giữa gói tiêm và vaccin

#### Cột hiện có cho mỗi bảng:

**SAN_PHAM:**
```sql
- Ma_SP (varchar(10), PK) - Mã sản phẩm
- Ten_SP (nvarchar(100)) - Tên sản phẩm
- Loai_SP (nvarchar(50)) - Loại sản phẩm (Thức ăn, Thuốc, Phụ kiện)
- Gia (decimal(18,2)) - Giá
- Don_Vi_Tinh (nvarchar(20)) - Đơn vị tính
- So_Luong (int, DEFAULT 0) - Số lượng tồn kho
```

**VAC_XIN:**
```sql
- Ma_Vacxin (varchar(10), PK) - Mã vaccin
- Ten_Vacxin (nvarchar(100)) - Tên vaccin
- Gia (decimal(18,2)) - Giá
- Xuat_Xu (nvarchar(100)) - Xuất xứ
```

**GOI_TIEM:**
```sql
- Ma_GT (varchar(10), PK) - Mã gói tiêm
- Ten_GT (nvarchar(100)) - Tên gói tiêm
- Thoi_Gian (nvarchar(20)) - Thời gian (vd: "6 tháng", "1 năm")
- Gia (decimal(18,2)) - Giá gói
```

**SOMUITIEM:**
```sql
- Ma_GT (varchar(10), FK -> GOI_TIEM) - Mã gói tiêm
- Ma_Vacxin (varchar(10), FK -> VAC_XIN) - Mã vaccin
- SoMuiTiem (int, DEFAULT 1) - Số mũi tiêm
```

#### Cột cần bổ sung:

**SAN_PHAM (cần thêm):**
- Mo_Ta (nvarchar(max)) - Mô tả sản phẩm
- Hinh_Anh (varchar(255)) - URL hình ảnh
- Trang_Thai (nvarchar(50)) - Trạng thái (Còn hàng, Hết hàng, Ngừng kinh doanh)
- Ngay_Tao (datetime, DEFAULT GETDATE())
- Ngay_Cap_Nhat (datetime)

**VAC_XIN (cần thêm):**
- Mo_Ta (nvarchar(max)) - Mô tả vaccin
- Benh_Phong_Ngua (nvarchar(255)) - Bệnh phòng ngừa
- Do_Tuoi_Su_Dung (nvarchar(100)) - Độ tuổi sử dụng
- Han_Su_Dung (date) - Hạn sử dụng
- So_Luong (int, DEFAULT 0) - Số lượng tồn kho
- Trang_Thai (nvarchar(50)) - Trạng thái (Còn hàng, Hết hàng, Hết hạn)
- Ngay_Tao (datetime, DEFAULT GETDATE())
- Ngay_Cap_Nhat (datetime)

**GOI_TIEM (cần thêm):**
- Mo_Ta (nvarchar(max)) - Mô tả gói
- Thoi_Gian_Thang (int) - Thời gian theo tháng
- Do_Tuoi_Ap_Dung (nvarchar(100)) - Độ tuổi áp dụng
- Loai_Thu_Cung (nvarchar(50)) - Loại thú cưng (Chó, Mèo, Tất cả)
- Trang_Thai (nvarchar(50)) - Trạng thái (Hoạt động, Không hoạt động)
- Ngay_Tao (datetime, DEFAULT GETDATE())
- Ngay_Cap_Nhat (datetime)

#### Stored Procedures cần có:

**SAN_PHAM (Products):**
- ✅ `TimKiemSanPham(@Ten_SP)` - Tìm kiếm sản phẩm theo tên
- ⚠️ `sp_GetAllProducts()` - Lấy tất cả sản phẩm
- ⚠️ `sp_GetProductById(@Ma_SP)` - Lấy chi tiết sản phẩm theo mã
- ⚠️ `sp_CreateProduct(@Ten_SP, @Loai_SP, @Gia, @Don_Vi_Tinh, @So_Luong, @Mo_Ta, @Hinh_Anh)` - Thêm sản phẩm mới
- ⚠️ `sp_UpdateProduct(@Ma_SP, @Ten_SP, @Loai_SP, @Gia, @Don_Vi_Tinh, @So_Luong, @Mo_Ta, @Hinh_Anh, @Trang_Thai)` - Cập nhật sản phẩm
- ⚠️ `sp_DeleteProduct(@Ma_SP)` - Xóa sản phẩm (soft delete hoặc hard delete)
- ⚠️ `sp_UpdateProductStock(@Ma_SP, @So_Luong)` - Cập nhật số lượng tồn kho
- ⚠️ `sp_GetProductsByCategory(@Loai_SP)` - Lấy sản phẩm theo loại

**VAC_XIN (Vaccines):**
- ⚠️ `sp_GetAllVaccines()` - Lấy tất cả vaccin
- ⚠️ `sp_GetVaccineById(@Ma_Vacxin)` - Lấy chi tiết vaccin theo mã
- ⚠️ `sp_CreateVaccine(@Ten_Vacxin, @Xuat_Xu, @Gia, @Mo_Ta, @Benh_Phong_Ngua, @Do_Tuoi_Su_Dung, @Han_Su_Dung, @So_Luong)` - Thêm vaccin mới
- ⚠️ `sp_UpdateVaccine(@Ma_Vacxin, @Ten_Vacxin, @Xuat_Xu, @Gia, @Mo_Ta, @Benh_Phong_Ngua, @Do_Tuoi_Su_Dung, @Han_Su_Dung, @So_Luong, @Trang_Thai)` - Cập nhật vaccin
- ⚠️ `sp_DeleteVaccine(@Ma_Vacxin)` - Xóa vaccin
- ⚠️ `sp_SearchVaccines(@keyword)` - Tìm kiếm vaccin
- ⚠️ `sp_GetExpiredVaccines()` - Lấy danh sách vaccin hết hạn
- ⚠️ `sp_UpdateVaccineStock(@Ma_Vacxin, @So_Luong)` - Cập nhật số lượng tồn kho

**GOI_TIEM (Vaccine Packages):**
- ⚠️ `sp_GetAllPackages()` - Lấy tất cả gói tiêm
- ⚠️ `sp_GetPackageById(@Ma_GT)` - Lấy chi tiết gói tiêm theo mã
- ⚠️ `sp_CreatePackage(@Ten_GT, @Thoi_Gian, @Thoi_Gian_Thang, @Gia, @Mo_Ta, @Do_Tuoi_Ap_Dung, @Loai_Thu_Cung)` - Thêm gói tiêm mới
- ⚠️ `sp_UpdatePackage(@Ma_GT, @Ten_GT, @Thoi_Gian, @Thoi_Gian_Thang, @Gia, @Mo_Ta, @Do_Tuoi_Ap_Dung, @Loai_Thu_Cung, @Trang_Thai)` - Cập nhật gói tiêm
- ⚠️ `sp_DeletePackage(@Ma_GT)` - Xóa gói tiêm
- ⚠️ `sp_GetPackageVaccines(@Ma_GT)` - Lấy danh sách vaccin trong gói
- ⚠️ `sp_AddVaccineToPackage(@Ma_GT, @Ma_Vacxin, @SoMuiTiem)` - Thêm vaccin vào gói
- ⚠️ `sp_RemoveVaccineFromPackage(@Ma_GT, @Ma_Vacxin)` - Xóa vaccin khỏi gói
- ⚠️ `sp_UpdateVaccineInPackage(@Ma_GT, @Ma_Vacxin, @SoMuiTiem)` - Cập nhật số mũi tiêm trong gói

#### Triggers hiện có và cần bổ sung:
- ⚠️ Trigger tự động cập nhật `Ngay_Cap_Nhat` khi UPDATE bảng SAN_PHAM, VAC_XIN, GOI_TIEM
- ✅ Trigger kiểm tra `So_Luong >= 0` (CHK_TonKho đã có cho SAN_PHAM)
- ⚠️ Trigger tự động cập nhật trạng thái sản phẩm khi So_Luong = 0
- ⚠️ Trigger kiểm tra `Han_Su_Dung` của vaccin và cập nhật trạng thái
- ⚠️ Trigger kiểm tra Gia > 0 cho SAN_PHAM, VAC_XIN, GOI_TIEM
- ⚠️ Trigger log lịch sử thay đổi giá (nếu cần)

---

## 2. BACKEND (Node.js + Express)

### 2.1. Controllers

#### productController.js
```javascript
⚠️ getProducts()         // GET /api/products - Gọi sp_GetAllProducts()
⚠️ getProductById()      // GET /api/products/:id - Gọi sp_GetProductById(@Ma_SP)
⚠️ createProduct()       // POST /api/products - Gọi sp_CreateProduct(...)
⚠️ updateProduct()       // PUT /api/products/:id - Gọi sp_UpdateProduct(...)
⚠️ deleteProduct()       // DELETE /api/products/:id - Gọi sp_DeleteProduct(@Ma_SP)
⚠️ searchProducts()      // GET /api/products/search?q= - Gọi TimKiemSanPham(@Ten_SP)
⚠️ updateStock()         // PATCH /api/products/:id/stock - Gọi sp_UpdateProductStock(...)
⚠️ getProductsByCategory() // GET /api/products/category/:category - Gọi sp_GetProductsByCategory(@Loai_SP)
```

#### vaccineController.js
```javascript
⚠️ getVaccines()         // GET /api/vaccines - Gọi sp_GetAllVaccines()
⚠️ getVaccineById()      // GET /api/vaccines/:id - Gọi sp_GetVaccineById(@Ma_Vacxin)
⚠️ createVaccine()       // POST /api/vaccines - Gọi sp_CreateVaccine(...)
⚠️ updateVaccine()       // PUT /api/vaccines/:id - Gọi sp_UpdateVaccine(...)
⚠️ deleteVaccine()       // DELETE /api/vaccines/:id - Gọi sp_DeleteVaccine(@Ma_Vacxin)
⚠️ searchVaccines()      // GET /api/vaccines/search?q= - Gọi sp_SearchVaccines(...)
⚠️ getExpiredVaccines()  // GET /api/vaccines/expired - Gọi sp_GetExpiredVaccines()
⚠️ updateStock()         // PATCH /api/vaccines/:id/stock - Gọi sp_UpdateVaccineStock(...)
```

#### packageController.js
```javascript
⚠️ getPackages()         // GET /api/packages - Gọi sp_GetAllPackages()
⚠️ getPackageById()      // GET /api/packages/:id - Gọi sp_GetPackageById(@Ma_GT)
⚠️ createPackage()       // POST /api/packages - Gọi sp_CreatePackage(...)
⚠️ updatePackage()       // PUT /api/packages/:id - Gọi sp_UpdatePackage(...)
⚠️ deletePackage()       // DELETE /api/packages/:id - Gọi sp_DeletePackage(@Ma_GT)
⚠️ addVaccineToPackage() // POST /api/packages/:id/vaccines - Gọi sp_AddVaccineToPackage(...)
⚠️ removeVaccineFromPackage() // DELETE /api/packages/:id/vaccines/:vaccineId - Gọi sp_RemoveVaccineFromPackage(...)
⚠️ getPackageVaccines()  // GET /api/packages/:id/vaccines - Gọi sp_GetPackageVaccines(@Ma_GT)
⚠️ updateVaccineInPackage() // PUT /api/packages/:id/vaccines/:vaccineId - Gọi sp_UpdateVaccineInPackage(...)
```

### 2.2. Routes
- ✅ `/api/products` - productRoutes.js
- ✅ `/api/vaccines` - vaccineRoutes.js
- ✅ `/api/packages` - packageRoutes.js

### 2.3. Middleware cần bổ sung
- ⚠️ Validation middleware (express-validator)
- ⚠️ Authentication check cho admin routes
- ⚠️ File upload middleware (multer) cho hình ảnh sản phẩm

### 2.4. Error Handling
- ✅ Global error handler
- ⚠️ Specific error messages cho từng loại lỗi
- ⚠️ HTTP status codes chuẩn

---

## 3. FRONTEND (React + TypeScript + Vite)

### 3.1. Pages (Admin)

#### Products.tsx
```typescript
✅ Component cơ bản
⚠️ Hiển thị danh sách sản phẩm với bảng
⚠️ Form thêm sản phẩm (Modal)
⚠️ Form sửa sản phẩm (Modal)
⚠️ Xác nhận xóa sản phẩm
⚠️ Tìm kiếm sản phẩm
⚠️ Filter theo category
⚠️ Pagination
⚠️ Upload hình ảnh sản phẩm
```

#### Vaccines.tsx
```typescript
✅ Component cơ bản
⚠️ Hiển thị danh sách vaccin với bảng
⚠️ Form thêm vaccin (Modal)
⚠️ Form sửa vaccin (Modal)
⚠️ Xác nhận xóa vaccin
⚠️ Tìm kiếm vaccin
⚠️ Hiển thị trạng thái hết hạn
⚠️ Filter theo status
⚠️ Pagination
```

#### VaccinePackages.tsx
```typescript
✅ Component cơ bản
⚠️ Hiển thị danh sách gói vaccin
⚠️ Form thêm gói (Modal)
⚠️ Form sửa gói (Modal)
⚠️ Xác nhận xóa gói
⚠️ Quản lý vaccin trong gói
  - Thêm vaccin vào gói
  - Xóa vaccin khỏi gói
  - Hiển thị danh sách vaccin trong gói
⚠️ Tìm kiếm gói
⚠️ Pagination
```

### 3.2. Components

#### Forms
```typescript
✅ ProductForm.tsx    - Form thêm/sửa sản phẩm
✅ VaccineForm.tsx    - Form thêm/sửa vaccin
✅ PackageForm.tsx    - Form thêm/sửa gói vaccin
⚠️ Validation cho tất cả forms
⚠️ Loading states
⚠️ Error messages
⚠️ Success notifications
```

#### Tables
```typescript
✅ ProductTable.tsx   - Bảng hiển thị sản phẩm
✅ VaccineTable.tsx   - Bảng hiển thị vaccin
✅ PackageTable.tsx   - Bảng hiển thị gói vaccin
⚠️ Sorting columns
⚠️ Action buttons (Edit, Delete)
⚠️ Status badges
⚠️ Empty state
```

#### UI Components
```typescript
✅ Modal.tsx          - Modal component
✅ Button.tsx         - Button component
✅ Input.tsx          - Input component
✅ Table.tsx          - Table component
⚠️ Select.tsx         - Select/Dropdown component
⚠️ DatePicker.tsx     - Date picker component
⚠️ FileUpload.tsx     - File upload component
⚠️ SearchBar.tsx      - Search bar component
⚠️ Pagination.tsx     - Pagination component
⚠️ Toast.tsx          - Toast notification
```

### 3.3. Services

#### api.ts
```typescript
// Products API
⚠️ getProducts()
⚠️ getProductById(id)
⚠️ createProduct(data)
⚠️ updateProduct(id, data)
⚠️ deleteProduct(id)
⚠️ searchProducts(query)

// Vaccines API
⚠️ getVaccines()
⚠️ getVaccineById(id)
⚠️ createVaccine(data)
⚠️ updateVaccine(id, data)
⚠️ deleteVaccine(id)
⚠️ searchVaccines(query)

// Packages API
⚠️ getPackages()
⚠️ getPackageById(id)
⚠️ createPackage(data)
⚠️ updatePackage(id, data)
⚠️ deletePackage(id)
⚠️ addVaccineToPackage(packageId, vaccineId, data)
⚠️ removeVaccineFromPackage(packageId, vaccineId)
⚠️ getPackageVaccines(packageId)
```

### 3.4. Types

#### types/index.ts
```typescript
⚠️ Product interface - Dựa trên bảng SAN_PHAM
  - Ma_SP: string
  - Ten_SP: string
  - Loai_SP: 'Thức ăn' | 'Thuốc' | 'Phụ kiện'
  - Gia: number
  - Don_Vi_Tinh: string
  - So_Luong: number
  - Mo_Ta?: string
  - Hinh_Anh?: string
  - Trang_Thai?: string
  - Ngay_Tao?: Date
  - Ngay_Cap_Nhat?: Date

⚠️ Vaccine interface - Dựa trên bảng VAC_XIN
  - Ma_Vacxin: string
  - Ten_Vacxin: string
  - Xuat_Xu: string
  - Gia: number
  - Mo_Ta?: string
  - Benh_Phong_Ngua?: string
  - Do_Tuoi_Su_Dung?: string
  - Han_Su_Dung?: Date
  - So_Luong?: number
  - Trang_Thai?: string
  - Ngay_Tao?: Date
  - Ngay_Cap_Nhat?: Date

⚠️ VaccinePackage interface - Dựa trên bảng GOI_TIEM
  - Ma_GT: string
  - Ten_GT: string
  - Thoi_Gian: string
  - Thoi_Gian_Thang?: number
  - Gia: number
  - Mo_Ta?: string
  - Do_Tuoi_Ap_Dung?: string
  - Loai_Thu_Cung?: string
  - Trang_Thai?: string
  - Ngay_Tao?: Date
  - Ngay_Cap_Nhat?: Date

⚠️ PackageVaccine interface - Dựa trên bảng SOMUITIEM
  - Ma_GT: string
  - Ma_Vacxin: string
  - SoMuiTiem: number
  - Vaccine?: Vaccine

⚠️ API Response types
⚠️ Form data types
```

---

## 4. TESTING

### 4.1. Backend Testing
- ⚠️ Unit tests cho controllers
- ⚠️ Integration tests cho API endpoints
- ⚠️ Database connection tests
- ⚠️ Stored procedures tests

### 4.2. Frontend Testing
- ⚠️ Component tests
- ⚠️ Form validation tests
- ⚠️ API integration tests
- ⚠️ E2E tests

---

## 5. PLAN THỰC HIỆN

### Phase 1: Database Foundation (3-4 giờ)
1. ⚠️ **Bổ sung cột thiếu cho các bảng**
   - Thêm cột mô tả, hình ảnh, trạng thái cho SAN_PHAM
   - Thêm các cột cần thiết cho VAC_XIN (mô tả, bệnh phòng ngừa, độ tuổi, hạn sử dụng, số lượng, trạng thái)
   - Thêm các cột cần thiết cho GOI_TIEM (mô tả, thời gian tháng, độ tuổi, loại thú cưng, trạng thái)
   - Thêm cột Ngay_Tao, Ngay_Cap_Nhat cho cả 3 bảng

2. ⚠️ **Tạo Stored Procedures cho SAN_PHAM**
   - sp_GetAllProducts
   - sp_GetProductById
   - sp_CreateProduct
   - sp_UpdateProduct
   - sp_DeleteProduct
   - sp_UpdateProductStock
   - sp_GetProductsByCategory

3. ⚠️ **Tạo Stored Procedures cho VAC_XIN**
   - sp_GetAllVaccines
   - sp_GetVaccineById
   - sp_CreateVaccine
   - sp_UpdateVaccine
   - sp_DeleteVaccine
   - sp_SearchVaccines
   - sp_GetExpiredVaccines
   - sp_UpdateVaccineStock

4. ⚠️ **Tạo Stored Procedures cho GOI_TIEM**
   - sp_GetAllPackages
   - sp_GetPackageById
   - sp_CreatePackage
   - sp_UpdatePackage
   - sp_DeletePackage
   - sp_GetPackageVaccines
   - sp_AddVaccineToPackage
   - sp_RemoveVaccineFromPackage
   - sp_UpdateVaccineInPackage

5. ⚠️ **Tạo Triggers**
   - Trigger cập nhật Ngay_Cap_Nhat tự động
   - Trigger cập nhật trạng thái dựa trên số lượng/hạn sử dụng
   - Trigger kiểm tra Gia > 0

6. ⚠️ **Insert sample data**
   - Thêm dữ liệu mẫu cho SAN_PHAM
   - Thêm dữ liệu mẫu cho VAC_XIN
   - Thêm dữ liệu mẫu cho GOI_TIEM và SOMUITIEM

7. ⚠️ **Test tất cả stored procedures**
   - Test CRUD cho từng bảng
   - Test các edge cases

### Phase 2: Backend API (3-4 giờ)
1. ⚠️ **Hoàn thiện productController.js**
   - Implement tất cả methods gọi stored procedures tương ứng
   - Map tên cột database (Ma_SP, Ten_SP...) sang response
   - Handle errors từ database

2. ⚠️ **Hoàn thiện vaccineController.js**
   - Implement tất cả methods gọi stored procedures
   - Map tên cột database (Ma_Vacxin, Ten_Vacxin...)
   - Handle errors từ database

3. ⚠️ **Hoàn thiện packageController.js**
   - Implement tất cả methods gọi stored procedures
   - Map tên cột database (Ma_GT, Ten_GT...)
   - Handle vaccine management trong package
   - Handle errors từ database

4. ⚠️ **Thêm validation middleware**
   - Validate input data (required fields, data types)
   - Validate Ma_SP, Ma_Vacxin, Ma_GT format
   - Validate giá > 0, số lượng >= 0

5. ⚠️ **Cập nhật routes**
   - Đảm bảo tất cả endpoints được định nghĩa
   - Thêm middleware authentication cho admin routes

6. ⚠️ **Test API với Postman/Thunder Client**
   - Test CRUD cho products
   - Test CRUD cho vaccines
   - Test CRUD cho packages
   - Test vaccine management trong packages

7. ⚠️ **Document API endpoints**
   - Tạo file API documentation hoặc Postman collection

### Phase 3: Frontend Components (4-5 giờ)
1. ⚠️ **Hoàn thiện types/interfaces**
   - Định nghĩa interface Product dựa trên SAN_PHAM
   - Định nghĩa interface Vaccine dựa trên VAC_XIN
   - Định nghĩa interface VaccinePackage dựa trên GOI_TIEM
   - Định nghĩa interface PackageVaccine dựa trên SOMUITIEM
   - Định nghĩa API Response types

2. ⚠️ **Implement API service functions trong api.ts**
   - Products API calls (getProducts, getProductById, createProduct, updateProduct, deleteProduct, searchProducts)
   - Vaccines API calls (getVaccines, getVaccineById, createVaccine, updateVaccine, deleteVaccine, searchVaccines)
   - Packages API calls (getPackages, getPackageById, createPackage, updatePackage, deletePackage, getPackageVaccines, addVaccineToPackage, removeVaccineFromPackage)
   - Handle API errors và response mapping

3. ⚠️ **Xây dựng UI components thiếu**
   - Select.tsx - Dropdown cho Loai_SP, Loai_Thu_Cung
   - DatePicker.tsx - Chọn Han_Su_Dung
   - FileUpload.tsx - Upload Hinh_Anh
   - SearchBar.tsx - Tìm kiếm
   - Pagination.tsx - Phân trang
   - Toast.tsx - Thông báo

4. ⚠️ **Hoàn thiện Forms với validation**
   - ProductForm: Validate tất cả fields (Ten_SP, Loai_SP, Gia, Don_Vi_Tinh, So_Luong)
   - VaccineForm: Validate (Ten_Vacxin, Xuat_Xu, Gia, Han_Su_Dung, So_Luong)
   - PackageForm: Validate (Ten_GT, Thoi_Gian, Gia, Loai_Thu_Cung)
   - Thêm loading states và error handling

5. ⚠️ **Implement Tables với full features**
   - ProductTable: Hiển thị Ma_SP, Ten_SP, Loai_SP, Gia, So_Luong, Trang_Thai
   - VaccineTable: Hiển thị Ma_Vacxin, Ten_Vacxin, Xuat_Xu, Gia, So_Luong, Han_Su_Dung, Trang_Thai
   - PackageTable: Hiển thị Ma_GT, Ten_GT, Thoi_Gian, Gia, Trang_Thai
   - Thêm sorting, action buttons (Edit, Delete)

6. ⚠️ **Add notifications/toasts**
   - Success messages khi CRUD thành công
   - Error messages khi có lỗi
   - Confirmation dialog cho delete actions

### Phase 4: Integration (3-4 giờ)
1. ⚠️ **Kết nối Frontend với Backend API**
   - Test connection và CORS settings
   - Verify API base URL trong api.ts

2. ⚠️ **Implement CRUD cho SAN_PHAM (Products)**
   - Hiển thị danh sách sản phẩm từ API
   - Thêm sản phẩm mới với form
   - Sửa sản phẩm
   - Xóa sản phẩm (có confirmation)
   - Tìm kiếm sản phẩm theo tên
   - Filter theo Loai_SP

3. ⚠️ **Implement CRUD cho VAC_XIN (Vaccines)**
   - Hiển thị danh sách vaccin từ API
   - Thêm vaccin mới với form
   - Sửa vaccin
   - Xóa vaccin (có confirmation)
   - Tìm kiếm vaccin
   - Hiển thị warning cho vaccin hết hạn

4. ⚠️ **Implement CRUD cho GOI_TIEM (Vaccine Packages)**
   - Hiển thị danh sách gói tiêm từ API
   - Thêm gói mới với form
   - Sửa gói
   - Xóa gói (có confirmation)
   - **Quản lý vaccin trong gói:**
     - Hiển thị danh sách vaccin trong gói
     - Thêm vaccin vào gói (chọn từ dropdown, nhập số mũi tiêm)
     - Xóa vaccin khỏi gói
     - Cập nhật số mũi tiêm

5. ⚠️ **Test toàn bộ luồng CRUD**
   - Test create -> read -> update -> delete cho từng module
   - Test edge cases (empty data, invalid input)

6. ⚠️ **Fix bugs và optimize**
   - Sửa lỗi phát sinh
   - Optimize render performance
   - Handle loading states properly

### Phase 5: Enhancement (2-3 giờ)
1. ⚠️ Add search/filter functionality
2. ⚠️ Implement pagination
3. ⚠️ Add loading states
4. ⚠️ Add error handling UI
5. ⚠️ Image upload cho products
6. ⚠️ Responsive design

### Phase 6: Testing & Documentation (2-3 giờ)
1. ⚠️ Write tests
2. ⚠️ Update documentation
3. ⚠️ Code review
4. ⚠️ Performance optimization
5. ⚠️ Security audit

---

## 6. CHECKLIST HOÀN THÀNH

### SAN_PHAM (Products) CRUD
- [ ] Database: Bổ sung cột (Mo_Ta, Hinh_Anh, Trang_Thai, Ngay_Tao, Ngay_Cap_Nhat)
- [ ] Database: Stored procedures đầy đủ (Get, GetById, Create, Update, Delete, UpdateStock, GetByCategory)
- [ ] Database: Triggers (auto update Ngay_Cap_Nhat, check So_Luong >= 0, auto update Trang_Thai)
- [ ] Backend: productController.js hoàn chỉnh với tất cả methods
- [ ] Backend: API endpoints test pass
- [ ] Frontend: Product interface định nghĩa theo SAN_PHAM
- [ ] Frontend: ProductForm với validation (Ten_SP, Loai_SP, Gia, Don_Vi_Tinh, So_Luong)
- [ ] Frontend: ProductTable hiển thị đầy đủ (Ma_SP, Ten_SP, Loai_SP, Gia, So_Luong, Trang_Thai)
- [ ] Frontend: Chức năng tìm kiếm theo Ten_SP
- [ ] Frontend: Filter theo Loai_SP (Thức ăn, Thuốc, Phụ kiện)
- [ ] Frontend: Upload hình ảnh sản phẩm
- [ ] Integration: CRUD đầy đủ Frontend ↔ Backend ↔ Database hoạt động

### VAC_XIN (Vaccines) CRUD
- [ ] Database: Bổ sung cột (Mo_Ta, Benh_Phong_Ngua, Do_Tuoi_Su_Dung, Han_Su_Dung, So_Luong, Trang_Thai, Ngay_Tao, Ngay_Cap_Nhat)
- [ ] Database: Stored procedures đầy đủ (Get, GetById, Create, Update, Delete, Search, GetExpired, UpdateStock)
- [ ] Database: Triggers (auto update Ngay_Cap_Nhat, check Han_Su_Dung, auto update Trang_Thai)
- [ ] Backend: vaccineController.js hoàn chỉnh với tất cả methods
- [ ] Backend: API endpoints test pass
- [ ] Frontend: Vaccine interface định nghĩa theo VAC_XIN
- [ ] Frontend: VaccineForm với validation (Ten_Vacxin, Xuat_Xu, Gia, Han_Su_Dung, So_Luong)
- [ ] Frontend: VaccineTable hiển thị đầy đủ (Ma_Vacxin, Ten_Vacxin, Xuat_Xu, Gia, So_Luong, Han_Su_Dung, Trang_Thai)
- [ ] Frontend: Chức năng tìm kiếm vaccin
- [ ] Frontend: Hiển thị warning cho vaccin hết hạn/sắp hết hạn
- [ ] Frontend: DatePicker cho Han_Su_Dung
- [ ] Integration: CRUD đầy đủ Frontend ↔ Backend ↔ Database hoạt động

### GOI_TIEM (Vaccine Packages) CRUD
- [ ] Database: Bổ sung cột (Mo_Ta, Thoi_Gian_Thang, Do_Tuoi_Ap_Dung, Loai_Thu_Cung, Trang_Thai, Ngay_Tao, Ngay_Cap_Nhat)
- [ ] Database: Stored procedures đầy đủ (Get, GetById, Create, Update, Delete, GetPackageVaccines, AddVaccineToPackage, RemoveVaccineFromPackage, UpdateVaccineInPackage)
- [ ] Database: Triggers (auto update Ngay_Cap_Nhat)
- [ ] Backend: packageController.js hoàn chỉnh với tất cả methods
- [ ] Backend: API endpoints test pass
- [ ] Frontend: VaccinePackage interface định nghĩa theo GOI_TIEM
- [ ] Frontend: PackageVaccine interface định nghĩa theo SOMUITIEM
- [ ] Frontend: PackageForm với validation (Ten_GT, Thoi_Gian, Gia, Loai_Thu_Cung)
- [ ] Frontend: PackageTable hiển thị đầy đủ (Ma_GT, Ten_GT, Thoi_Gian, Gia, Trang_Thai)
- [ ] Frontend: UI quản lý vaccin trong package
  - [ ] Hiển thị danh sách vaccin trong gói (với số mũi tiêm)
  - [ ] Thêm vaccin vào gói (dropdown chọn vaccin + input số mũi tiêm)
  - [ ] Xóa vaccin khỏi gói (confirmation dialog)
  - [ ] Cập nhật số mũi tiêm
- [ ] Integration: CRUD đầy đủ Frontend ↔ Backend ↔ Database hoạt động
- [ ] Integration: Quản lý vaccines trong package hoạt động hoàn toàn

---

## 7. NOTES & CONSIDERATIONS

### Security
- [ ] Validate all inputs (backend + frontend)
- [ ] Sanitize database queries
- [ ] Check user permissions (Admin only)
- [ ] Secure file uploads

### Performance
- [ ] Index database tables properly
- [ ] Implement pagination
- [ ] Optimize queries
- [ ] Add caching if needed

### User Experience
- [ ] Clear error messages
- [ ] Loading indicators
- [ ] Success notifications
- [ ] Confirmation dialogs for delete
- [ ] Responsive design
- [ ] Intuitive UI/UX

### Code Quality
- [ ] Follow consistent naming conventions
- [ ] Add comments for complex logic
- [ ] Handle edge cases
- [ ] DRY principle
- [ ] Proper error handling

---

## 8. RESOURCES

### Documentation
- MySQL Stored Procedures: https://dev.mysql.com/doc/
- Express.js: https://expressjs.com/
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/

### Tools
- Postman/Thunder Client - API testing
- MySQL Workbench - Database management
- VS Code - Code editor
- Git - Version control

---

**Tổng thời gian ước tính: 16-22 giờ làm việc**

**Ưu tiên cao:**
1. Hoàn thiện Backend API + Database
2. Implement Frontend CRUD cơ bản
3. Testing và bug fixes

**Ưu tiên trung bình:**
4. Search/Filter functionality
5. Image upload
6. Advanced UI features

**Ưu tiên thấp:**
7. Performance optimization
8. Advanced testing
9. Documentation

---

## 9. GIT COMMIT STRATEGY

### Branch Strategy
- **Main branch:** `main` - Code production stable
- **Development branch:** `develop` hoặc `feature/CRUD-and-Statistic` - Code đang phát triển
- **Feature branches:** Tạo nhánh riêng cho mỗi phase nếu cần

### Phase 1: Database Foundation - Commits

**1.1. Bổ sung schema**
```bash
git add database/02_create_table.sql
git commit -m "feat(db): add missing columns to SAN_PHAM table

- Add Mo_Ta (nvarchar(max))
- Add Hinh_Anh (varchar(255))
- Add Trang_Thai (nvarchar(50))
- Add Ngay_Tao (datetime, DEFAULT GETDATE())
- Add Ngay_Cap_Nhat (datetime)"
```

```bash
git add database/02_create_table.sql
git commit -m "feat(db): add missing columns to VAC_XIN table

- Add Mo_Ta, Benh_Phong_Ngua, Do_Tuoi_Su_Dung
- Add Han_Su_Dung, So_Luong, Trang_Thai
- Add Ngay_Tao, Ngay_Cap_Nhat"
```

```bash
git add database/02_create_table.sql
git commit -m "feat(db): add missing columns to GOI_TIEM table

- Add Mo_Ta, Thoi_Gian_Thang
- Add Do_Tuoi_Ap_Dung, Loai_Thu_Cung, Trang_Thai
- Add Ngay_Tao, Ngay_Cap_Nhat"
```

**1.2. Stored Procedures - Products**
```bash
git add database/05_stored_procedures.sql
git commit -m "feat(db): add SAN_PHAM stored procedures

- sp_GetAllProducts: Get all products
- sp_GetProductById: Get product by Ma_SP
- sp_CreateProduct: Create new product
- sp_UpdateProduct: Update existing product
- sp_DeleteProduct: Delete product
- sp_UpdateProductStock: Update stock quantity
- sp_GetProductsByCategory: Filter by category"
```

**1.3. Stored Procedures - Vaccines**
```bash
git add database/05_stored_procedures.sql
git commit -m "feat(db): add VAC_XIN stored procedures

- sp_GetAllVaccines: Get all vaccines
- sp_GetVaccineById: Get vaccine by Ma_Vacxin
- sp_CreateVaccine: Create new vaccine
- sp_UpdateVaccine: Update existing vaccine
- sp_DeleteVaccine: Delete vaccine
- sp_SearchVaccines: Search vaccines
- sp_GetExpiredVaccines: Get expired vaccines
- sp_UpdateVaccineStock: Update stock"
```

**1.4. Stored Procedures - Packages**
```bash
git add database/05_stored_procedures.sql
git commit -m "feat(db): add GOI_TIEM stored procedures

- sp_GetAllPackages: Get all packages
- sp_GetPackageById: Get package by Ma_GT
- sp_CreatePackage: Create new package
- sp_UpdatePackage: Update existing package
- sp_DeletePackage: Delete package
- sp_GetPackageVaccines: Get vaccines in package
- sp_AddVaccineToPackage: Add vaccine to package
- sp_RemoveVaccineFromPackage: Remove vaccine from package
- sp_UpdateVaccineInPackage: Update vaccine doses"
```

**1.5. Triggers**
```bash
git add database/06_triggers.sql
git commit -m "feat(db): add triggers for auto-update and validation

- trg_SanPham_UpdateTime: Auto-update Ngay_Cap_Nhat for SAN_PHAM
- trg_VacXin_UpdateTime: Auto-update Ngay_Cap_Nhat for VAC_XIN
- trg_GoiTiem_UpdateTime: Auto-update Ngay_Cap_Nhat for GOI_TIEM
- trg_SanPham_CheckStock: Auto-update Trang_Thai when So_Luong = 0
- trg_VacXin_CheckExpiry: Auto-update Trang_Thai based on Han_Su_Dung
- trg_CheckPrice: Validate Gia > 0 for all tables"
```

**1.6. Sample Data**
```bash
git add database/03_insert_sample_data.sql
git commit -m "feat(db): add sample data for products, vaccines, packages

- Add 10+ sample products in different categories
- Add 10+ sample vaccines with different manufacturers
- Add 5+ sample packages with vaccine relationships
- Add data in SOMUITIEM for package-vaccine mapping"
```

### Phase 2: Backend API - Commits

**2.1. Product Controller**
```bash
git add Backend/src/controllers/productController.js
git commit -m "feat(api): implement product CRUD controller

- getProducts: GET all products
- getProductById: GET product by ID
- createProduct: POST new product
- updateProduct: PUT update product
- deleteProduct: DELETE product
- searchProducts: GET search by name
- updateStock: PATCH update stock
- getProductsByCategory: GET filter by category"
```

**2.2. Vaccine Controller**
```bash
git add Backend/src/controllers/vaccineController.js
git commit -m "feat(api): implement vaccine CRUD controller

- getVaccines: GET all vaccines
- getVaccineById: GET vaccine by ID
- createVaccine: POST new vaccine
- updateVaccine: PUT update vaccine
- deleteVaccine: DELETE vaccine
- searchVaccines: GET search vaccines
- getExpiredVaccines: GET expired vaccines
- updateStock: PATCH update stock"
```

**2.3. Package Controller**
```bash
git add Backend/src/controllers/packageController.js
git commit -m "feat(api): implement package CRUD controller

- getPackages: GET all packages
- getPackageById: GET package by ID
- createPackage: POST new package
- updatePackage: PUT update package
- deletePackage: DELETE package
- getPackageVaccines: GET vaccines in package
- addVaccineToPackage: POST add vaccine to package
- removeVaccineFromPackage: DELETE remove vaccine
- updateVaccineInPackage: PUT update vaccine doses"
```

**2.4. Routes & Middleware**
```bash
git add Backend/src/routes/productRoutes.js Backend/src/routes/vaccineRoutes.js Backend/src/routes/packageRoutes.js
git commit -m "feat(api): update routes for products, vaccines, packages

- Add all CRUD endpoints
- Add search and filter endpoints
- Add validation middleware
- Add authentication middleware for admin routes"
```

**2.5. Validation**
```bash
git add Backend/src/middleware/validation.js
git commit -m "feat(api): add input validation middleware

- Validate product data (Ten_SP, Loai_SP, Gia, So_Luong)
- Validate vaccine data (Ten_Vacxin, Xuat_Xu, Han_Su_Dung)
- Validate package data (Ten_GT, Thoi_Gian, Gia)
- Validate ID formats (Ma_SP, Ma_Vacxin, Ma_GT)"
```

### Phase 3: Frontend Components - Commits

**3.1. TypeScript Types**
```bash
git add Frontend/src/types/index.ts
git commit -m "feat(types): add TypeScript interfaces for CRUD entities

- Product interface based on SAN_PHAM table
- Vaccine interface based on VAC_XIN table
- VaccinePackage interface based on GOI_TIEM table
- PackageVaccine interface based on SOMUITIEM table
- API response types"
```

**3.2. API Services**
```bash
git add Frontend/src/services/api.ts
git commit -m "feat(api): implement API service functions

Products API:
- getProducts, getProductById, createProduct
- updateProduct, deleteProduct, searchProducts

Vaccines API:
- getVaccines, getVaccineById, createVaccine
- updateVaccine, deleteVaccine, searchVaccines

Packages API:
- getPackages, getPackageById, createPackage
- updatePackage, deletePackage
- getPackageVaccines, addVaccineToPackage
- removeVaccineFromPackage"
```

**3.3. UI Components**
```bash
git add Frontend/src/components/ui/
git commit -m "feat(ui): add missing UI components

- Select.tsx: Dropdown component
- DatePicker.tsx: Date picker component
- FileUpload.tsx: File upload component
- SearchBar.tsx: Search bar component
- Pagination.tsx: Pagination component
- Toast.tsx: Notification toast component"
```

**3.4. Forms**
```bash
git add Frontend/src/components/forms/
git commit -m "feat(forms): implement CRUD forms with validation

- ProductForm: Form for create/edit product
- VaccineForm: Form for create/edit vaccine
- PackageForm: Form for create/edit package
- Add client-side validation
- Add loading states and error handling"
```

**3.5. Tables**
```bash
git add Frontend/src/components/tables/
git commit -m "feat(tables): implement data tables with actions

- ProductTable: Display products with actions
- VaccineTable: Display vaccines with actions
- PackageTable: Display packages with actions
- Add sorting, filtering, status badges
- Add Edit/Delete action buttons"
```

**3.6. Pages**
```bash
git add Frontend/src/pages/admin/Products.tsx
git commit -m "feat(products): implement Products page with full CRUD

- Display product list from API
- Add/Edit product with modal form
- Delete product with confirmation
- Search products by name
- Filter by category
- Pagination"
```

```bash
git add Frontend/src/pages/admin/Vaccines.tsx
git commit -m "feat(vaccines): implement Vaccines page with full CRUD

- Display vaccine list from API
- Add/Edit vaccine with modal form
- Delete vaccine with confirmation
- Search vaccines
- Display expiry warnings
- Pagination"
```

```bash
git add Frontend/src/pages/admin/VaccinePackages.tsx
git commit -m "feat(packages): implement VaccinePackages page with full CRUD

- Display package list from API
- Add/Edit package with modal form
- Delete package with confirmation
- Manage vaccines in package:
  * Display vaccines list
  * Add vaccine to package
  * Remove vaccine from package
  * Update vaccine doses
- Pagination"
```

### Phase 4: Integration - Commits

**4.1. Integration Testing**
```bash
git add Frontend/ Backend/
git commit -m "fix: fix integration issues between frontend and backend

- Fix CORS configuration
- Fix API response mapping
- Fix data type conversions
- Handle API errors properly"
```

**4.2. Bug Fixes**
```bash
git commit -m "fix(products): fix product CRUD bugs

- Fix product creation validation
- Fix product update not refreshing list
- Fix delete confirmation dialog
- Fix search not working properly"
```

```bash
git commit -m "fix(vaccines): fix vaccine CRUD bugs

- Fix date picker format for Han_Su_Dung
- Fix vaccine stock update
- Fix expired vaccine detection
- Fix search functionality"
```

```bash
git commit -m "fix(packages): fix package management bugs

- Fix vaccine addition to package
- Fix vaccine removal from package
- Fix dose update not saving
- Fix package vaccines not loading"
```

### Phase 5: Enhancement - Commits

**5.1. Search & Filter**
```bash
git commit -m "feat: add advanced search and filter features

- Product search by name with debounce
- Vaccine search with multiple criteria
- Package filtering by status
- Category filtering for products"
```

**5.2. Pagination**
```bash
git commit -m "feat: implement pagination for all lists

- Add pagination component
- Implement server-side pagination
- Add page size selector
- Show total records count"
```

**5.3. File Upload**
```bash
git commit -m "feat: add image upload for products

- Implement file upload component
- Add image preview
- Validate file type and size
- Store image URL in database"
```

**5.4. UI/UX Improvements**
```bash
git commit -m "feat: improve UI/UX with loading states and notifications

- Add loading spinners for API calls
- Add success/error toast notifications
- Add confirmation dialogs for destructive actions
- Improve responsive design
- Add empty states for lists"
```

### Phase 6: Final Polish - Commits

**6.1. Documentation**
```bash
git add README.md CRUD_COMPLETION_PLAN.md
git commit -m "docs: update documentation

- Update README with CRUD features
- Add API endpoint documentation
- Add setup instructions
- Add troubleshooting guide"
```

**6.2. Code Quality**
```bash
git commit -m "refactor: improve code quality and consistency

- Remove duplicate code
- Improve error handling
- Add JSDoc comments
- Follow naming conventions
- Clean up unused imports"
```

**6.3. Final Testing**
```bash
git commit -m "test: add tests for CRUD functionality

- Add unit tests for controllers
- Add integration tests for API
- Add component tests for forms
- Add E2E tests for critical flows"
```

**6.4. Release**
```bash
git commit -m "chore: prepare release v1.0.0

- Update version numbers
- Update changelog
- Final bug fixes
- Performance optimization"
```

### Commit Message Guidelines

**Format:** `<type>(<scope>): <subject>`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Scopes:**
- `db`: Database changes
- `api`: Backend API
- `ui`: Frontend UI components
- `forms`: Form components
- `tables`: Table components
- `products`: Products module
- `vaccines`: Vaccines module
- `packages`: Packages module

**Examples:**
```bash
feat(db): add stored procedures for products CRUD
fix(api): fix product controller validation error
docs(readme): update API documentation
refactor(ui): extract common table component
test(products): add unit tests for product form
```

### Push Strategy

**Sau mỗi phase hoàn thành:**
```bash
# Review changes
git status
git diff

# Stage and commit (theo từng commit nhỏ như trên)
git add <files>
git commit -m "<message>"

# Push to remote
git push origin feature/CRUD-and-Statistic
```

**Merge vào main khi hoàn thành:**
```bash
# Switch to main
git checkout main

# Merge feature branch
git merge feature/CRUD-and-Statistic

# Push to remote
git push origin main

# Tag release
git tag -a v1.0.0 -m "Release CRUD features for Products, Vaccines, Packages"
git push origin v1.0.0
```
