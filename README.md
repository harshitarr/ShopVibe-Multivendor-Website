# ShopVibe

ShopVibe is a modern, full-featured e-commerce platform designed to provide a seamless shopping experience for both buyers and sellers. The project is built with scalability, performance, and user experience in mind, supporting multi-store management, product discovery, and secure transactions.

## Features Implemented
- Multi-store support: Users can create and manage their own stores
- Product catalog with advanced filtering (category, price, discount, etc.)
- Shopping cart and order management
- Coupon and discount system
- Ratings and reviews for products
- Admin dashboard for store and order management
- Seller dashboard for product and order management
- Secure authentication and authorization (admin, seller, buyer roles)
- Responsive design for mobile and desktop
- Integration with Stripe for payments
- Address management for users
- AI-powered product recommendations (optional)

## Unique Features
- Store approval workflow for new sellers
- Real-time order tracking and analytics
- AI integration for product suggestions (if enabled)
- Modular and scalable codebase with clear separation of concerns
- Customizable store pages for each seller

## Screenshots
> Add screenshots of the main pages and features here (e.g., Home, Product Page, Cart, Admin Dashboard, Store Management, etc.)

---

## Tech Stack

### Frontend
- Next.js (React framework)
- Tailwind CSS (utility-first CSS framework)
- Context API & Redux Toolkit (state management)

### Backend
- Next.js API routes (serverless functions)
- Node.js

### Database & API
- MongoDB (with Mongoose ODM)
- RESTful API structure
- Stripe API (for payments)
- ImageKit (for image hosting)
- OpenAI API (optional, for AI features)
- Grok API
- Inngest
- Clerk

---

## Environmental Variables
Create a `.env.local` file in the root directory and add the following variables:

```
MONGODB_URI=your_mongodb_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
OPENAI_API_KEY=your_openai_api_key (optional)
NEXTAUTH_SECRET=your_nextauth_secret
```

---

## Running Environment

### Prerequisites
- Node.js (v18 or above recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### Setup & Run
1. Clone the repository:
	```sh
	git clone https://github.com/yourusername/shopvibe.git
	cd shopvibe
	```
2. Install dependencies:
	```sh
	npm install
	# or
	yarn install
	```
3. Configure environment variables as described above.
4. Run the development server:
	```sh
	npm run dev
	# or
	yarn dev
	```
5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.



