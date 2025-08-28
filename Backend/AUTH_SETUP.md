# Database Authentication Setup Guide

## 🚀 Quick Setup

### 1. Environment Variables
Make sure your `.env` file has these variables:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 2. Install Dependencies
```bash
cd Backend
npm install
```

### 3. Seed Test Users
Run the user seeder to create test accounts:
```bash
node utils/userSeeder.js
```

### 4. Start Backend Server
```bash
npm start
```

## 🔐 Test Credentials

After running the seeder, you can use these credentials:

### Super Admin
- **Email:** superadmin@example.com
- **Password:** password123
- **Access:** Everything (clients, items, customers, home)

### Admin
- **Email:** admin@example.com
- **Password:** password123
- **Access:** Items, customers, home (no clients)

### Staff
- **Email:** staff@example.com
- **Password:** password123
- **Access:** Home/cart only (no sidebar)

## 🗄️ Database Schema

### User Model
```javascript
{
  clientId: ObjectId,        // null for super admin
  name: String,              // User's full name
  email: String,             // Unique email
  phoneNumber: String,       // Phone number
  passwordHash: String,      // Hashed password
  role: String,              // 'super_admin', 'admin', 'customer'
  rfidCardId: String         // For customers only
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Request Format
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

### Response Format
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "user_id",
    "username": "user@example.com",
    "ownerName": "User Name",
    "email": "user@example.com",
    "phoneNumber": "1234567890",
    "role": "super-admin",
    "client": "client_name"
  }
}
```

## 🛡️ Security Features

- **Password Hashing:** bcryptjs with salt rounds
- **JWT Tokens:** Secure session management
- **HTTP-Only Cookies:** XSS protection
- **CORS Configuration:** Frontend origin only
- **Input Validation:** Server-side validation

## 🔄 Frontend Integration

The frontend is already configured to:
- Connect to `http://localhost:5000/api/auth`
- Handle cookies automatically
- Manage user sessions
- Provide role-based access control

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your `MONGO_URI` in `.env`
   - Ensure MongoDB is running

2. **CORS Errors**
   - Verify frontend is running on `http://localhost:4200`
   - Check CORS configuration in `server.js`

3. **JWT Errors**
   - Ensure `JWT_SECRET` is set in `.env`
   - Check token expiration

4. **Login Fails**
   - Verify user exists in database
   - Check password is correct
   - Ensure user role is not 'customer'

### Debug Commands

```bash
# Check if users exist
node -e "
const mongoose = require('mongoose');
const User = require('./models/user.model.js');
mongoose.connect(process.env.MONGO_URI).then(() => {
  User.find().then(users => console.log(users));
});
"

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin@example.com","password":"password123"}'
```

## 📝 Adding New Users

### Via Code
```javascript
const bcrypt = require('bcryptjs');
const User = require('./models/user.model.js');

const newUser = new User({
  name: 'New User',
  email: 'newuser@example.com',
  phoneNumber: '1234567890',
  passwordHash: await bcrypt.hash('password123', 12),
  role: 'admin'
});

await newUser.save();
```

### Via Database
```javascript
// Direct database insertion (not recommended for production)
db.users.insertOne({
  name: 'New User',
  email: 'newuser@example.com',
  phoneNumber: '1234567890',
  passwordHash: '$2a$12$...', // Use bcrypt to generate
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## 🔒 Production Considerations

1. **Environment Variables**
   - Use strong JWT secrets
   - Secure MongoDB connection strings
   - Enable HTTPS in production

2. **Security Headers**
   - Add helmet.js for security headers
   - Configure rate limiting
   - Enable request logging

3. **Password Policy**
   - Implement password strength requirements
   - Add password reset functionality
   - Enable account lockout

4. **Monitoring**
   - Add error logging
   - Monitor authentication attempts
   - Set up alerts for failed logins
