Refugee Camp Resource Allocator
A centralized, real-time resource management system designed to optimize the distribution of aid in refugee camps. This project focuses on four key sectors: Food, Shelter, Health, and Education, utilizing a real-time gap analysis engine to ensure equitable allocation.

Live Demo
Deployment Platform: Render

Database: Managed MySQL via Aiven

Live URL: [PASTE YOUR RENDER URL HERE]

Tech Stack
Frontend: React.js

Backend: Node.js and Express.js

Database: MySQL (Cloud-hosted on Aiven)

API Integration: UNHCR Operational Data Portal API

IDE: Visual Studio Code (VS Code)

Key Features
Real-Time Gap Analysis: Automatically calculates resource shortages by comparing current inventory against UN humanitarian standards.

API Synchronization: Fetches live demographic data for the Kakuma Refugee Camp to adjust requirements dynamically.

Role-Based Authentication: Secure access for Administrators and Health Officers.

Inventory Tracking: Comprehensive monitoring of stocks across multiple aid sectors.

Installation and Setup
Prerequisites
Node.js (v16 or higher)

MySQL Workbench (optional, for local DB management)

A GitHub account

1. Clone the Repository
Bash
git clone https://github.com/[YOUR_USERNAME]/refugee-camp-allocator.git
cd refugee-camp-allocator
2. Backend Setup
Bash
cd backend
npm install
Create a .env file in the /backend directory and add your Aiven credentials:

Code snippet
DB_HOST=your-aiven-host
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=refugee_allocator
DB_PORT=your-port
PORT=5000
3. Frontend Setup
Bash
cd ../frontend
npm install
npm start
Database Schema
The system uses a relational schema designed for high-performance reporting. Key tables include:

users: Stores encrypted credentials and roles.

population_stats: Synchronized data from UNHCR ODP.

inventory: Current resource levels for Food, Health, Shelter, and Education.

License
This project is for academic purposes as part of a Bachelor of Science in Statistics and Information Technology.

How to update it on GitHub:
Save the file as README.md in your main folder.

Run these commands in your terminal:

Bash
git add README.md
git commit -m "Updated README to professional format"
git push origin main