# Task Management Application

Task Tracker is an innovative solution that transforms your daily task management experience. With a focus on encouraging concentrated work and effective prioritization, this app allows users to set and prioritize daily tasks seamlessly. Task Tracker goes beyond traditional 'to-do list' or task management apps by providing quick insights into your progress and overall daily completion status.

## Prerequisites

Before running the application, ensure you have the following installed:

- [Docker](https://www.docker.com/products/docker-desktop)
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (Node.js package manager)

## Running with Docker

1. Clone the repository:

    ```bash
    git clone https://github.com/N-Pacis/task-manager-backend.git
    ```

2. Navigate to the project directory:

    ```bash
    cd task-manager-backend
    ```

3. Create a `.env` file with the required environment variables. You can use the provided `.env.example` as a template.

4. Build and run the Docker containers:

    ```bash
    docker-compose up -d
    ```

5. Access the application at [http://localhost:5000](http://localhost:5000).

6. To stop the containers:

    ```bash
    docker-compose down
    ```

## Running Manually

1. Clone the repository:

    ```bash
    git clone https://github.com/N-Pacis/task-manager-backend.git
    ```

2. Navigate to the project directory:

    ```bash
    cd task-manager-backend
    ```

3. Create a `.env` file with the required environment variables. You can use the provided `.env.example` as a template.

4. Install dependencies:

    ```bash
    npm install
    ```

5. Run Sequelize migrations:

    ```bash
    npx sequelize-cli db:migrate --env DEV
    ```

6. Start the application:

    ```bash
    npm start
    ```

7. Access the application at [http://localhost:5000](http://localhost:5000).

8. To stop the application, press `Ctrl + C` in the terminal.

