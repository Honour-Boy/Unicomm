# UniComm

UniComm is a sophisticated, dark-themed web application designed for real-time multilingual communication. It facilitates seamless interaction among users by offering functionalities like user registration, profile management, and instant messaging with automatic translation. Built using React JS and Tailwind CSS on the frontend, and Node.js, Express.js on the backend, with Firebase for database management, UniComm provides a modern, minimalist, and user-friendly interface for efficient communication.

## Overview

UniComm's architecture is structured to support real-time, scalable, and secure communication. The frontend is developed with React JS for dynamic user interfaces and Tailwind CSS for a custom, responsive design. The backend leverages Node.js and Express.js to handle API requests, user authentication, and integrations. Firebase is used for data persistence, storing user profiles, and chat messages. Real-time messaging is powered by WebSocket, ensuring instant communication across users. The application also integrates an external translation API for on-the-fly translation of messages, making it ideal for multilingual teams.

## Final Year Project

This project was my final year project at university, where I initially finetuned a large language model (LLM) to use for real-time communication. However, due to some issues with my model, I have since switched to using an external translation method. Despite this change, UniComm remains a robust and effective solution for multilingual communication.

## Features

- **User Registration and Authentication**: Secure signup/login processes to manage user access.
- **Profile Management**: Users can update their personal information.
- **Real-time Messaging**: Instant communication with one or multiple users.
- **Automatic Translation**: Messages are automatically translated, supporting diverse languages and enhancing cross-cultural communication.
- **Modern UI**: A dark-themed, minimalist design that is easy to navigate, providing a pleasant user experience.

## Getting Started

### Requirements

- Node.js (latest stable version)
- Git
- Firebase CLI

### Quickstart

1. **Clone the repository**

```bash
git clone <repository-url>
```

2. **Navigate to the project directory**

```bash
cd UniComm
```

3. **Install dependencies**

```bash
npm install
```

4. **Set up Firebase**

- Ensure you have a Firebase project created and configured.
- Update the `src/firebase/unicomm-2d7bc-firebase-adminsdk-o81cb-6c982c2971.json` file with your Firebase project credentials.

5. **Environment Variables**

- Create a `.env` file in the root directory.
- Add the necessary environment variables as specified in the `.env.example` file.

6. **Run the application**

- Start the backend server:

```bash
npm run start:backend
```

- In a new terminal, start the frontend application:

```bash
npm run dev
```

The application should now be running on `http://localhost:3000` (or your specified port).

## License

This Project is licensed under the MIT license.