# School Forum - Grades 11 & 12

A comprehensive web-based login and sign-up system for a school forum with Gmail authentication, file uploads, and role-based access control.

## 🚀 Features

### Authentication & Registration
- Gmail-only registration with school ID upload
- Email verification system
- Admin approval workflow for enrollment verification
- Role-based access control (G11, G12, Admin, Moderator)

### Security
- Secure password hashing with bcrypt
- JWT token authentication
- File validation and cleanup after verification
- Prevention of duplicate Gmail/School ID registration

### User Interface
- PinoyCorner-inspired design (bright, clean, forum-friendly)
- Responsive sidebar navigation
- Card-style login/signup forms
- Mobile-friendly responsive design

### Access Control
- **Pending Verification**: General Discussion only
- **Verified G11**: General Discussion + G11 Forum
- **Verified G12**: General Discussion + G12 Forum  
- **Moderator/Admin**: Full access

## 🏗️ Tech Stack

- **Frontend**: React.js 18+ with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Authentication**: Gmail OAuth + JWT
- **File Upload**: Multer with validation
- **Email**: Nodemailer for verification

## 📁 Project Structure

```
school-forum/
├── frontend/                 # React.js application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   └── package.json
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── uploads/             # Temporary file storage
│   └── package.json
├── database/                # MySQL schemas & seeds
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Gmail Developer Account (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd school-forum
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   
   Create `.env` file:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=school_forum
   JWT_SECRET=your_jwt_secret
   GMAIL_CLIENT_ID=your_gmail_client_id
   GMAIL_CLIENT_SECRET=your_gmail_client_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

3. **Database Setup**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend && npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_forum
JWT_SECRET=your_super_secret_jwt_key
GMAIL_CLIENT_ID=your_gmail_oauth_client_id
GMAIL_CLIENT_SECRET=your_gmail_oauth_client_secret
EMAIL_USER=noreply@yourschool.edu
EMAIL_PASS=your_gmail_app_password
BASE_URL=http://localhost:3000
```

## 📱 Usage

### For Students
1. **Sign Up**: Register with Gmail and upload school ID
2. **Verify Email**: Check email and click verification link
3. **Wait for Approval**: Admin verifies enrollment and grade level
4. **Access Forums**: Once approved, access grade-appropriate forums

### For Administrators
1. **Admin Panel**: Access pending registrations
2. **Review Documents**: Verify uploaded school IDs
3. **Approve/Reject**: Set user grade levels (G11/G12)
4. **Manage Users**: Update roles and permissions

## 🛡️ Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Tokens**: Secure authentication with expiration
- **File Validation**: Type and size restrictions for uploads
- **Rate Limiting**: Prevent brute force attacks
- **Input Sanitization**: SQL injection prevention
- **CORS Configuration**: Controlled cross-origin requests

## 🎨 UI Design Guidelines

Based on PinoyCorner layout:
- **Colors**: Orange (#FF6B35), White (#FFFFFF), Light Gray (#F8F9FA)
- **Typography**: Clean, readable fonts
- **Layout**: Sidebar navigation with main content area
- **Components**: Card-style forms with rounded corners
- **Buttons**: Large, rounded with hover effects
- **Responsive**: Mobile-first design approach

## 🔧 Development

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### API Endpoints

```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/verify       # Email verification
GET  /api/auth/profile      # Get user profile
POST /api/upload/school-id  # Upload school ID
GET  /api/admin/pending     # Get pending users
PUT  /api/admin/approve     # Approve user
```

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: admin@yourschool.edu

---

**Built with ❤️ for Grades 11 & 12 students**