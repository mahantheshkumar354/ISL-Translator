# ISL Translator

### AI-Powered Indian Sign Language Recognition and Translation Platform

**ISL Translator** is a full-stack AI application designed to recognize and translate **Indian Sign Language (ISL)** gestures into text through a web-based interface. The system combines computer vision, machine learning, and modern web technologies to provide an accessible communication and learning platform.

---

## Overview

Communication barriers between the deaf and hearing communities remain a significant challenge. ISL Translator aims to address this gap by providing an intelligent platform capable of recognizing ISL gestures and converting them into meaningful text.

The application follows a full-stack architecture with a **React + TypeScript frontend**, **FastAPI backend**, and an integrated **machine-learning prediction pipeline** for gesture recognition.

---

## Key Features

* **ISL Gesture Recognition**
  Detects and interprets Indian Sign Language gestures using computer vision and machine-learning techniques.

* **Sign-to-Text Translation**
  Converts recognized gestures into readable text in real time.

* **User Authentication**
  Secure registration and login functionality using JWT-based authentication.

* **Protected User Sessions**
  Authenticated users can access application-specific functionality and resources.

* **Translation History**
  Supports storing and accessing previous translation activity.

* **Learning Resources**
  Provides resources to help users understand and learn Indian Sign Language.

* **Responsive Interface**
  Designed to work across desktop and mobile browsers.

* **RESTful API**
  FastAPI-based backend for authentication, machine-learning inference, and application services.

---

## Technology Stack

| Layer            | Technologies                         |
| ---------------- | ------------------------------------ |
| Frontend         | React, TypeScript, Vite              |
| Styling          | Tailwind CSS                         |
| UI / Animation   | Framer Motion, React Icons           |
| Backend          | Python, FastAPI, Uvicorn             |
| Computer Vision  | OpenCV                               |
| Machine Learning | NumPy, ML prediction pipeline        |
| Authentication   | JWT                                  |
| Database         | SQLite / configured project database |
| Version Control  | Git, GitHub                          |

---

## System Architecture

```text
┌───────────────────────────┐
│       Web / Mobile        │
│           User            │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│     React + TypeScript    │
│          Frontend         │
│                           │
│  • Authentication         │
│  • Translation UI         │
│  • Learning Resources     │
│  • User Interface         │
└─────────────┬─────────────┘
              │
              │ REST API
              ▼
┌───────────────────────────┐
│         FastAPI           │
│          Backend          │
│                           │
│  • Authentication         │
│  • API Routes             │
│  • ML Inference           │
│  • Database Operations    │
└─────────────┬─────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
┌─────────────┐ ┌──────────────┐
│ ML / CV     │ │   Database   │
│ Pipeline    │ │              │
│             │ │ Users        │
│ OpenCV      │ │ History      │
│ Prediction  │ │ Application  │
└─────────────┘ └──────────────┘
```

---

## Project Structure

```text
isl-translator-final-main/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── ml/
│   │   ├── routers/
│   │   └── ...
│   │
│   ├── run.py
│   ├── requirements.txt
│   └── ...
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── ...
│
├── public/
│
├── package.json
├── package-lock.json
├── vite.config.*
├── tailwind.config.*
├── .gitignore
└── README.md
```

---

# Installation and Setup

## Prerequisites

Make sure the following are installed:

* **Python 3.11+**
* **Node.js 18+**
* **npm**
* **Git**

---

## 1. Clone the Repository

```bash
git clone https://github.com/mahantheshkumar354/isl-translator.git
cd isl-translator
```

---

## 2. Frontend Setup

Install the required Node.js packages:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

## 3. Backend Setup

Open a new terminal and navigate to the backend:

```powershell
cd backend
```

Create a Python virtual environment:

```powershell
python -m venv .venv
```

Activate the environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

---

## 4. Start the FastAPI Server

From the `backend` directory:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Configuration

If the project uses environment variables, create a `.env` file according to the project's configuration.

Example:

```env
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
```

**Never commit real credentials, API keys, passwords, or secret keys to GitHub.**

---

# Authentication Flow

```text
User
 │
 ▼
Login / Register
 │
 ▼
FastAPI Authentication API
 │
 ▼
Credential Validation
 │
 ▼
JWT Access Token
 │
 ▼
Frontend Local Storage
 │
 ▼
Authenticated Application
```

The frontend sends authentication requests to the FastAPI backend and stores the returned JWT access token for authenticated API requests.

---

# API

The backend provides REST endpoints for application functionality.

Example authentication endpoint:

```text
POST /api/v1/auth/login
```

FastAPI automatically provides interactive API documentation through:

```text
/api/docs
```

or:

```text
/docs
```

depending on the application configuration.

---

# Machine Learning Pipeline

The ISL recognition workflow can be summarized as:

```text
Camera Input
     │
     ▼
Frame Capture
     │
     ▼
Image Preprocessing
     │
     ▼
Hand / Gesture Detection
     │
     ▼
Feature Extraction
     │
     ▼
ML Prediction
     │
     ▼
ISL Sign Classification
     │
     ▼
Text Output
```

The prediction layer is integrated with the FastAPI backend so that the frontend can communicate with the recognition system through API requests.

---

# Development

Start the frontend:

```bash
npm run dev
```

Start the backend:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

During development, both services should remain running simultaneously.

---

# Security Considerations

The project follows basic application-security practices including:

* JWT-based authentication
* Password-based user authentication
* Protected application routes
* Environment-variable configuration
* Exclusion of sensitive files through `.gitignore`

For production deployment, additional security measures such as HTTPS, secure cookies/token handling, production secrets management, rate limiting, and stricter CORS configuration should be implemented.

---

# Future Enhancements

Potential improvements include:

* Real-time continuous sign-language translation
* Expanded ISL gesture vocabulary
* Sentence-level gesture recognition
* Text-to-speech output
* Speech-to-text input
* Improved recognition accuracy
* Multi-language translation
* Cloud deployment
* Mobile application support
* Model performance monitoring
* User analytics and personalized learning

---

# Use Cases

ISL Translator can be used in scenarios such as:

* Communication assistance
* ISL learning and education
* Accessibility-focused applications
* Academic and research projects
* Human-computer interaction
* AI and computer-vision demonstrations

---

# Project Status

**Status:** Active Development

The project is currently being developed and tested locally. Features and machine-learning capabilities may evolve as the system is improved.

---

# Contributing

Contributions are welcome.

To contribute:

```bash
git clone https://github.com/YOUR-USERNAME/isl-translator.git
cd isl-translator
```

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Commit your changes:

```bash
git add .
git commit -m "Add: your feature"
```

Push the branch:

```bash
git push origin feature/your-feature
```

Then open a Pull Request on GitHub.

---

# License

This project is intended for educational, research, and development purposes.

If you plan to distribute or commercialize the project, add an appropriate open-source license such as **MIT**, **Apache-2.0**, or another license that matches your intended usage.

---

# Author

**Mahanthesh Kumar**

Computer Science & Engineering

---

## Acknowledgements

This project builds upon open-source technologies and libraries from the Python and JavaScript ecosystems, including FastAPI, React, Vite, OpenCV, and related machine-learning tools.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
