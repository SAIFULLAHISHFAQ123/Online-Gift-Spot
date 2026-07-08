# Online Gift Spot 🎁

Online Gift Spot is a feature-rich, full-stack gift registry, marketplace, and social web application. It enables users to create events, manage wishlists, connect with friends, and purchase gifts using a virtual wallet. It also provides dedicated portals for vendors to sell products and manage orders, as well as an administrative dashboard for full platform oversight.

---

## 🚀 Tech Stack

### Frontend (Client)
* **Framework:** React 19 (Vite)
* **Styling:** Tailwind CSS, PostCSS
* **Routing:** React Router DOM (v7)
* **Animations:** Framer Motion
* **Icons:** React Icons
* **Charts/Analytics:** Recharts
* **State & Network:** Axios, Context API, React Toastify

### Backend (Server)
* **Runtime:** Node.js
* **Framework:** Express
* **Database:** MongoDB (via Mongoose ODM)
* **Authentication:** Bcryptjs (password hashing)
* **File Uploads:** Multer (local storage for product images)
* **CORS & Environment:** Cors, Dotenv

---

## 🌟 Key Features

### 👤 User Features
* **Authentication & Profiles:** Secure registration and login for buyers, vendors, and admins.
* **Event Registry:** Create and manage special events (birthdays, weddings, custom celebrations) with specific dates, and link a custom wishlist to each.
* **Wishlist Management:** Add, customize, and maintain multiple wishlist items from the marketplace to share with friends.
* **Friend System:** Search and add friends, manage friend requests, and view friends' upcoming events and public wishlists to buy matching gifts.
* **Marketplace & Shopping Cart:** Browse vendor items, search/filter products, add products to a shopping cart, and complete orders.
* **Virtual Wallet:** A simulated digital wallet containing virtual credits to make seamless purchases.

### 🏪 Vendor Features
* **Vendor Dashboard:** Quick stats on sales, product lists, and order summaries.
* **Product Catalog Management:** Add, edit, or remove products (including image uploads) available in the global marketplace.
* **Order Fulfillment:** Track customer orders, view billing/shipping details, and update the status of purchases (e.g., Pending to Shipped).
* **Vendor Profile:** Manage store details and public contact information.

### 🔑 Admin Features
* **Admin Dashboard:** Platform-wide oversight displaying key statistics (total users, total vendors, total sales).
* **System Moderation:** Overview and management of registered users, vendors, and marketplace products to maintain platform standards.

---

## 📁 Project Structure

```text
online-gift-spot/
├── server/                 # Express Backend Server
│   ├── models/             # MongoDB Mongoose Schemas (User, Vendor, Product, Event, Wishlist, Order, Friend)
│   ├── routes/             # Express API Endpoints (Auth, Products, Events, Wishlists, Friends, Orders)
│   ├── public/uploads/     # Stored product and vendor images uploaded via Multer
│   ├── server.js           # Server entry point & DB connection
│   └── package.json        # Backend dependencies
│
└── src/                    # React Frontend Client
    ├── assets/             # Images, logos, and static resources
    ├── components/         # Reusable UI components
    ├── context/            # Global React Context providers (AuthContext)
    ├── hooks/              # Custom React Hooks
    ├── layouts/            # Page layouts (DashboardLayout)
    ├── pages/              # Main view screens (Dashboard, Marketplace, Cart, Friends, Wishlist, etc.)
    ├── routes/             # App routing configuration (AppRoutes)
    ├── styles/             # Application CSS themes
    ├── App.jsx             # Root React component
    └── main.jsx            # Frontend entry point
```

---

## 🛠️ Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/SAIFULLAHISHFAQ123/Online-Gift-Spot.git
cd Online-Gift-Spot
```

### 2. Configure & Run Backend Server
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server/` directory and configure the environment variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/giftspot_db
   JWT_SECRET=your_jwt_secret_here # (If JWT auth is implemented/updated)
   ```
4. Start the server:
   ```bash
   node server.js
   ```
   *The backend will run on `http://localhost:5000`.*

### 3. Configure & Run Frontend Client
1. Navigate back to the root directory and then into the source folder if necessary, or simply work from the root:
   ```bash
   # From project root:
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## 🔌 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new User or Vendor |
| `/api/auth/login` | `POST` | Authenticate User/Vendor and return session |
| `/api/products` | `GET` / `POST` | List all products or create a new product (Vendor only) |
| `/api/events` | `GET` / `POST` | Fetch user events or create a new event |
| `/api/wishlist` | `GET` / `POST` | View or add items to user wishlist |
| `/api/friends` | `GET` / `POST` | Manage connections and friend requests |
| `/api/orders` | `GET` / `POST` | Place orders and track fulfillment |

---

## 📄 License

This project is licensed under the ISC License. See the `package.json` files for more details.
