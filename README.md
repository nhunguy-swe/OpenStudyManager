# 📚 StudyMate + (Customized Version) - by nhunguy-swe

🚀 Enhanced version with Notes system, Timetable interaction, and improved UI/UX

> A modern study management system with AI assistance, task tracking, and personalized learning workflows.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://openstudymanager.netlify.app/)
[![Your Repo Stars](https://img.shields.io/github/stars/nhunguy-swe/OpenStudyManager?style=social)](https://github.com/nhunguy-swe/OpenStudyManager)
[![GitHub Stars](https://img.shields.io/github/stars/mintahandrews/studymate?style=social)](https://github.com/mintahandrews/studymate)
[![Repo](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/nhunguy-swe/OpenStudyManager)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

![StudyMate Preview](StudyMatePlusPreview.png)

## ✨ Features

- 🤖 **AI Study Assistant** – Get instant help with study materials
- ⏱️ **Smart Study Timer** – Track focus sessions with subject selection
- 📊 **Progress Analytics** – Visualize study time and performance
- 📝 **Task Management** – Manage tasks with subject-based filtering and completion tracking
- 📘 **Subject Management** – CRUD subjects with custom color tagging
- 🗒️ **Smart Notes** – Create and organize notes linked to each subject
- 📅 **Weekly Timetable** – Plan schedule by day/session with modal editing
- 🎨 **Modern UI** – Clean card-based interface for better usability
- 💾 **LocalStorage** – Automatically save and persist user data

## 🎯 Purpose

This project was built to enhance the original StudyMate application by improving usability, adding structured note-taking, and providing better study planning tools for students.

## 🛠️ My Contributions

This project is based on the open-source StudyMate application. I have made the following improvements:

- Redesigned UI with modern card-based layout for better UX
- Implemented Notes system linked to Subjects
- Built Weekly Timetable with modal editing
- Enhanced Study Timer with subject tracking
- Added LocalStorage persistence for user data
- Improved Analytics data accuracy
- Refactored code structure
- Integrated additional APIs

## 🚀 Key Technologies

- React 18 with TypeScript
- Google's Gemini AI API
- Supabase for Backend
- TailwindCSS for Styling
- PDF.js & Mammoth for Document Processing
- Web Speech API for Voice Input

## 🛠️ Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A modern web browser

### Installation

1. Clone the repository

```bash
git clone https://github.com/nhunguy-swe/OpenStudyManager
cd OpenStudyManager
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables
   Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
# or
yarn build
```

## 🛠️ Tech Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Router**: React Router
- **AI Integration**: Google Generative AI
- **Backend/Auth**: Supabase
- **Build Tool**: Vite
- **Package Manager**: npm/yarn
- **Icons**: Lucide React
- **Notifications**: react-hot-toast
- **Date Handling**: date-fns
- **File Parsing**:
  - PDF.js (PDF files)
  - Mammoth (Word documents)
- **Code Highlighting**: react-syntax-highlighter
- **Markdown**: react-markdown with remark-gfm

## 📁 Project Structure

```
OpenStudyManager/
├── public/
│   └── sounds/          # Notification sound files
├── src/
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── pages/           # Page components
│   ├── utils/           # Utility functions
│   └── types.ts         # TypeScript types
├── .env                 # Environment variables
└── package.json         # Dependencies and scripts
```

## 🔑 Key Components

### Task Management

- `TaskList.tsx`: Main task management component
- `SubjectManager.tsx`: Subject management interface
- `TaskForm.tsx`: Task creation/editing form

### Notes System (Customized)
- `Notes.tsx`: Main notes page linked to subjects
- `NoteCard.tsx`: Display note items in card UI
- `NoteEditor.tsx`: Create and edit notes

### Timetable (Customized)
- `Timetable.tsx`: Weekly schedule with interactive editing

### Timer Components

- `PomodoroTimer.tsx`: Pomodoro technique timer
- `StudyTimer.tsx`: Simple study session timer

### AI Integration

- `AiAssistant.tsx`: AI-powered study assistant
- `ChatInterface.tsx`: Chat interface for AI interaction

## 🎨 Customization

### Theme

The app uses Tailwind CSS for styling. Customize the theme in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Your custom colors
      },
    },
  },
};
```

### Timer Settings

Modify default timer settings in the respective components:

- `PomodoroTimer.tsx`: Default work/break durations
- `StudyTimer.tsx`: Default session duration

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Bug Reports

If you find a bug, please open an issue with:

- A clear description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots if applicable

## 🙏 Acknowledgments

- Sound effects from [Freesound](https://freesound.org/)
- Icons from [Lucide](https://lucide.dev/)

## 🙏 Original Author

This project is based on the original repository:  
https://github.com/mintahandrews/studymate

Original author: codemintah

---

Made with ❤️ for students everywhere
