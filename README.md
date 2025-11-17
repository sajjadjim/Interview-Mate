# 🚀 Interview Mate

Bridging the gap between ambitious talent and innovative companies through real-time, topic-focused interviews.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tech](https://img.shields.io/badge/tech-Next.js-black?logo=nextdotjs)
![Language](https://img.shields.io/badge/language-JavaScript-yellow?logo=javascript)

---

## 🌟 About The Project

Interview Mate is a modern web platform built with **Next.js** designed to solve a major challenge for both students and recruiters. Students struggle to get real-world interview experience, and companies struggle to find and vet qualified candidates efficiently.

This platform provides a dedicated space for students to take demo interviews, build confidence, and then participate in **live, scheduled interviews** with real company HR professionals. Recruiters can post interview slots, filter by specific topics (e.g., "React Hooks," "Data Structures"), and evaluate talent in a real-time setting.

### 📸 Project Screenshot

*(Add a great screenshot of your application's homepage or dashboard here!)*
![Interview Mate Screenshot](./public/images/screenshot.png)

---

## ✨ Key Features

This platform is built with two primary user roles in mind:

### 👩‍🎓 For Students

* **Create Your Profile:** Showcase your skills, projects, and what you're passionate about.
* **Demo Interviews:** Practice common interview questions on your own time to build confidence.
* **Topic-Specific Interviews:** Sign up for interviews on the exact topics you excel in.
* **Real-Time Scheduling:** Book available interview slots posted by real companies.
* **Live Interview Room:** Join a live video call to connect directly with HR and technical recruiters.

### 🏢 For Companies (HR)

* **Company Profile:** Establish your company's brand and what you're looking for.
* **Post Interview Slots:** Define the topic, duration, and time for interviews you want to conduct.
* **Discover Talent:** Browse student profiles who have signed up for your topics.
* **Efficient Vetting:** Move beyond resumes and assess a candidate's communication and technical skills live.
* **Real-Time Evaluation:** Conduct interviews and manage your hiring pipeline, all in one place.

---

## 🛠️ Built With

This project leverages a modern, high-performance tech stack:

* **[Next.js](https://nextjs.org/):** A powerful React framework for server-side rendering (SSR) and a great developer experience.
* **[React](https://reactjs.org/):** A JavaScript library for building user interfaces.
* **[JavaScript (ES6+)](https://www.javascript.com/):** The core language of the web.
* **[Tailwind CSS](https://tailwindcss.com/):** A utility-first CSS framework for beautiful, custom designs.
* **[Socket.IO](https://socket.io/) / [WebRTC](https://webrtc.org/):** (Suggested) For handling real-time video and chat communication.
* **[MongoDB](https://www.mongodb.com/) / [Prisma](https://www.prisma.io/):** (Suggested) For the database and ORM.
* **[NextAuth.js](https://next-auth.js.org/):** (Suggested) For handling user authentication (Student & HR accounts).

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You must have [Node.js](https://nodejs.org/en/) (v18 or later) and `npm` or `yarn` installed on your machine.

### Installation

1.  **Clone the repo**
    ```bash
    git clone [https://github.com/your-username/interview-mate.git](https://github.com/your-username/interview-mate.git)
    ```
2.  **Navigate to the project directory**
    ```bash
    cd interview-mate
    ```
3.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```
4.  **Set up environment variables**
    Create a file named `.env.local` in the root of the project and add your environment variables.
    ```
    # .env.local
    
    # Example Database URL (e.g., MongoDB or PostgreSQL)
    DATABASE_URL="your_database_connection_string"
    
    # Auth Secret (generate a random string)
    NEXTAUTH_SECRET="your_random_secret_string"
    NEXTAUTH_URL="http://localhost:3000"
    
    # Add any other API keys (e.g., for video service)
    # ...
    ```
5.  **Run the development server**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result!

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` file for more information.

---

## 👤 Author

**Sajjad Hossain Jim**

* GitHub: [@your-username](https://github.com/your-username)
* LinkedIn: [your-linkedin-profile](https://linkedin.com/in/your-linkedin)

<br>
<p align="center">
  Made with ❤️ for all aspiring developers.
</p>