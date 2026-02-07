# Imagiseum - AI-Powered Image Gallery

Imagiseum is AI-powered image gallery and sharing platform that allows users to generate unique images using Cloudflare AI, organize them with tags, and share them in a public gallery.

**Live Demo:** [https://final-project-i260.onrender.com/](https://final-project-i260.onrender.com/)

## 🚀 Features

- **AI Image Generation**: Create stunning visuals using prompts powered by Cloudflare AI.
- **Secure Authentication**: JWT-based user registration, login, and profile management.
- **Dynamic Gallery**: View, search, and filter images by name, prompt, or tags.
- **Tagging System**: Automatic tag aggregation for easy discovery of popular themes.
- **Personalized Profiles**: Manage your own generated images and update your profile details.
- **Responsive Design**: An interactive UI built with modern CSS and HTML.

## 🛠️ API Documentation

### Authentication (`/api/auth`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/register` | `POST` | Public | Register a new user |
| `/login` | `POST` | Public | Login and receive JWT token |
| `/me` | `GET` | Private | Check authentication status |
| `/profile` | `GET` | Private | Get current user's profile and images |
| `/profile` | `PUT` | Private | Update name or email |
| `/logout` | `POST` | Private | Logout user |

### Images (`/api/images`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | Public | List all images (supports `search` and `tags` queries) |
| `/:id` | `GET` | Public | Get details of a specific image |
| `/generate`| `POST` | Private | Generate a new image using a prompt (Cloudflare AI) |
| `/` | `POST` | Private | Save a generated image to the database |
| `/:id` | `PUT` | Private | Update image details (name, description, tags) |
| `/:id` | `DELETE`| Private | Delete an image |

### Tags (`/api/tags`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | Public | Get all tags sorted by popularity |

## 💻 Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas URI)
- Cloudflare AI API Credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd final_project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDFLARE_ACCOUNT_ID=your_id
   CLOUDFLARE_API_TOKEN=your_token
   CLOUDFLARE_AI_MODEL=@cf/bytedance/stable-diffusion-xl-lightning
   ```

4. **Run the application:**
   ```bash
   # For production
   npm start

   # For development (with nodemon)
   npm run dev
   ```

5. **Visit the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.
