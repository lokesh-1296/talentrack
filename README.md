# TalentTrack

TalentTrack is a professional talent identification and recruitment platform designed to bridge the gap between athletes and coaches. By combining performance tracking, gamification, and AI-powered video analysis, TalentTrack provides a data-driven approach to sports recruitment.

## Features

### Athlete Dashboard
- Performance Tracking: Record and monitor physical test results including vertical jump, shuttle run, and more.
- AI Video Analysis: Upload performance videos for automated verification and analysis using computer vision.
- Gamification: Earn XP and coins by completing tests and achieving benchmarks.
- Profile Management: Maintain a professional athletic profile for scouts to discover.

### Coach and Scout Tools
- Talent Discovery: Browse a comprehensive database of athletes with detailed performance metrics.
- Shortlisting: Save and track high-potential talent for future recruitment.
- Messaging System: Secure, direct communication channel between coaches and athletes.

### Technical Core
- AI-Powered Insights: Leverages MediaPipe and OpenCV for motion tracking and performance validation.
- Secure Authentication: JWT-based authentication for secure data access and user roles.
- Modern Architecture: Scalable FastAPI backend coupled with a responsive React frontend.

## Tech Stack

### Frontend
- React 18
- Vite
- Axios
- React Router DOM

### Backend
- FastAPI
- SQLAlchemy (SQLite)
- Pydantic
- Passlib (JWT Authentication)
- OpenCV and MediaPipe (Computer Vision)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.9 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lokesh-1296/talent-track.git
   cd talent-track
   ```

2. Frontend Setup:
   ```bash
   npm install
   ```

3. Backend Setup:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the Backend Server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
   The API will be available at http://localhost:8000.

2. Start the Frontend Development Server:
   ```bash
   # From the project root
   npm run dev
   ```
   The application will be accessible at http://localhost:5173.

## Project Structure

- `/backend`: FastAPI source code, database models, and ML modules.
- `/src`: React frontend source code, components, and pages.
- `/public`: Static assets and configuration files.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
