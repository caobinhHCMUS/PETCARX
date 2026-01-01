# PETCARX Backend API

Backend server for PETCARX Pet Care Management System.

## Tech Stack
- Node.js + Express
- SQL Server (mssql driver)
- CORS enabled

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update database connection settings:
     - For Windows Authentication: Set `DB_TRUSTED_CONNECTION=true`
     - For SQL Auth: Set `DB_USER` and `DB_PASSWORD`

3. **Database Requirements:**
   - SQL Server must be running
   - Database `PETCARX` must exist
   - Tables and stored procedures must be created (run scripts in `/database`)

4. **Run server:**
   ```bash
   npm run dev    # Development with auto-reload
   npm start      # Production
   ```

## API Endpoints

### Customer
- `GET /api/customer/:id/pets` - Get customer's pets
- `GET /api/customer/:id/stats` - Get customer statistics
- `GET /api/customer/:id/appointments` - Get customer appointments
- `POST /api/customer/appointments` - Create appointment
- `GET /api/customer/pets/:petId/history` - Get pet medical history

### Doctor
- `GET /api/doctor/:id/stats` - Get doctor statistics
- `GET /api/doctor/:id/appointments` - Get doctor appointments
- `POST /api/doctor/:id/medical-records` - Create medical record

### Admin
- `GET /api/admin/stats` - Get business statistics
- `GET /api/admin/revenue` - Get revenue report

## Database Connection

The server uses Windows Authentication by default. Edit `.env` to use SQL Server Authentication instead.
