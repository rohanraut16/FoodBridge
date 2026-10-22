
# FoodBridge 🍲

### Connecting Surplus Food with People in Need

FoodBridge is a web-based food donation management platform designed to connect food donors with NGOs and help distribute surplus food to people in need. The platform provides separate dashboards for Donors, NGOs, and Administrators to manage donations, approvals, food verification, and collection activities.

## 📌 Project Overview

FoodBridge aims to reduce food wastage and improve food donation coordination through a centralized digital platform. Donors can submit surplus food details, administrators can review donation requests, and NGOs can manage collection and physical food verification.

## ✨ Key Features

### 👤 1. Donor Module
- Donor registration and login.
- Submit food donation details, including food type, quantity, condition, and pickup address.
- Upload food images.
- Add messages related to donations.
- View donation history and current status.
- Track donation progress through the donor dashboard.

### 🏢 2. NGO Module
- Dedicated NGO dashboard.
- View available and approved donations.
- Review donation and pickup details.
- Manage assigned and completed collections.
- Perform physical food verification.
- Record collection details and verification information.

### 🛡️ 3. Admin Module
- Dedicated administrator dashboard.
- View total donations, donors, and NGOs.
- Review pending donation requests.
- Approve or reject donations.
- Manage donation records.
- View registered NGOs.
- Update administrator profile.

### 🥗 4. Food Quality Verification
- Physical verification of food condition.
- Check food appearance, smell, packaging, expiry information, and storage conditions where supported.
- Record quality-related information to help support safer food collection decisions.

### 📊 5. Dashboard and Donation Management
- Role-specific dashboards.
- Donation status tracking.
- Recent donation records.
- Collection and approval management.
- Flash messages for success, warning, and error feedback.

## 🔄 Donation Workflow

1. **Donor:** Submits a food donation request.
2. **Admin:** Reviews the request.
3. **Approval:** The administrator approves or rejects the donation.
4. **NGO:** Views approved donations and manages collection.
5. **Verification:** Food condition is physically checked.
6. **Collection:** The collection status is recorded.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and layouts |
| JavaScript | Client-side interactions |
| EJS | Dynamic page rendering |
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MongoDB | Database |
| Mongoose | MongoDB object modelling |
| Passport.js | Authentication |
| bcrypt.js | Password hashing |
| Express Session | Session management |
| Bootstrap | UI components and responsive layouts |
| Git & GitHub | Version control and collaboration |
| MongoDB Compass | Database management |

## 📁 Project Structure

```text
FoodBridge/
├── config/
│   ├── dbConnection.js
│   └── passport.js
├── middleware/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── style.css
│   │   │   ├── sidebar.css
│   │   │   ├── admin.css
│   │   │   └── donor.css
│   │   ├── js/
│   │   └── uploads/
│   ├── index.js
│   └── upload.js
├── models/
│   ├── user.js
│   └── donation.js
├── routes/
│   ├── home.js
│   ├── auth.js
│   ├── donor.js
│   ├── admin.js
│   └── agent.js
├── views/
│   ├── admin/
│   ├── agent/
│   ├── auth/
│   ├── donor/
│   ├── home/
│   ├── partials/
│   ├── 404page.ejs
│   └── layout.ejs
├── app.js
├── package.json
└── README.md
```

*Note: The NGO module currently uses some legacy internal filenames such as `agent.js` and the `views/agent/` directory.*

## ⚙️ Installation and Setup

### Prerequisites
- Node.js and npm
- MongoDB installed locally or a MongoDB Atlas account
- Visual Studio Code (recommended)
- MongoDB Compass (optional)

### Step 1: Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd FoodBridge
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the actual repository URL.

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb://127.0.0.1:27017/FoodBridge
PORT=5000
```

Use your own MongoDB connection string if you use MongoDB Atlas. Keep database credentials and other secrets private.

### Step 4: Start MongoDB

Make sure the local MongoDB service is running, or confirm that your Atlas database is accessible.

### Step 5: Start the Application

```bash
npm start
```

If the `start` script is not configured, check `package.json`. You may be able to start the app using:

```bash
node app.js
```

### Step 6: Open in Browser

```text
http://localhost:5000
```

## 👥 User Roles

| Role | Responsibilities |
|---|---|
| Donor | Submit donations and view donation status |
| NGO | Manage available donations and collection activities |
| Admin | Review requests and manage donation records |

Administrator accounts should be created or assigned only by a trusted project administrator. Public registration should not allow users to select the Admin role.

## 🗄️ Database Models

### User Model
Stores user account details, including name, email, hashed password, role, and optional profile information.

### Donation Model
Stores donation details such as donor reference, food type, quantity, food condition, image, dates, pickup address, contact details, messages, and donation status.

## 🔐 Security Considerations

- Store passwords using a secure hashing algorithm.
- Keep `.env` and database credentials out of public repositories.
- Restrict administrative access to authorized accounts.
- Validate user input and uploaded files.
- Use a strong session secret before deployment.
- Configure HTTPS and secure cookies for production.

## 🚀 Future Enhancements

- Email or in-app notifications for donation updates.
- Detailed analytics and report exports.
- Improved donation-status audit logs.
- Automated testing for authentication and donation workflows.
- Additional validation and deployment security.
- More advanced food freshness and shelf-life assessment.

## 🎓 Project Purpose

FoodBridge is an academic web development project demonstrating role-based authentication, database integration, donation management, and coordination between donors, administrators, and NGOs.

## 📄 License

No license has been specified yet. Add a suitable `LICENSE` file if the project will be distributed or reused publicly.

---

### FoodBridge — Share Food. Support Communities. Reduce Waste. 