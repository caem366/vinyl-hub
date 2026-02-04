# VinylHub

A vinyl records marketplace platform where users can buy, sell, and trade vinyl records. VinylHub connects vinyl enthusiasts with a curated selection of records, providing a seamless experience for browsing, listing, and purchasing vinyl albums.

## 🎨 Design

View the complete UI/UX design on Figma:
[VinylHub UI Mockup](https://www.figma.com/design/kN1dQDQRKVkUiSEAFWYBjc/Vinylhub-UI-Mockup?node-id=0-1&t=LihJeU4EX53SZ5RI-1)

## ✨ Features

- **User Authentication** - Secure login and registration system
- **Product Catalog** - Browse and search vinyl records with detailed information
- **Listings Management** - Create, edit, and manage your vinyl listings
- **Messaging System** - Built-in inbox for buyer-seller communication
- **Wishlist** - Save favorite records for later
- **Blog** - Read and create blog posts about vinyl culture
- **Shopping Cart & Checkout** - Smooth purchasing experience
- **Condition Grading** - Standardized vinyl condition ratings

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/caem366/vinyl-hub.git
cd vinyl-hub
```

### 2. Firebase Configuration

1. Copy the example config file:
   ```bash
   cp config/firebase-config.example.js config/firebase-config.js
   ```

2. Go to your [Firebase Console](https://console.firebase.google.com/)
3. Select your project or create a new one
4. Go to Project Settings > General
5. Scroll down to "Your apps" and copy your Firebase configuration
6. Replace the placeholder values in `config/firebase-config.js` with your actual credentials

### 3. Service Account Key (for backend/functions)

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Save the downloaded JSON file as `config/serviceAccountKey.json`

**⚠️ NEVER commit this file to Git!**

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Project

Open [index.html](index.html) in your browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

Then navigate to `http://localhost:8000`

## 📁 Project Structure

```
vinylhub/
├── config/              # Firebase configuration files
├── functions/           # Firebase Cloud Functions
├── images/              # Image assets
├── scripts/             # JavaScript files
│   ├── controllers/     # Business logic controllers
│   └── routes/          # API route handlers
├── uploads/             # User-uploaded content
├── *.html              # HTML pages
└── styles.css          # Global styles
```

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Firestore, Authentication, Storage, Cloud Functions)
- **Deployment**: Firebase Hosting

## 🔒 Security Notes

- `config/firebase-config.js` and `config/serviceAccountKey.json` are ignored by Git
- Never commit API keys or service account credentials
- Use environment variables for production deployments

## 📝 License

This project is for educational purposes.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.
