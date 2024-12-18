# Star Wars Explorer

## Introduction
Thank you for exploring this Star Wars-themed web application! This project aims to display detailed information about **People** and **Planets** from the [Star Wars API (SWAPI)](https://swapi.py4e.com/api/). Designed as a fun yet functional tool, the application enables sorting, searching, and pagination of Star Wars data through an intuitive interface.

## Objective
The goal of this project is to develop a web application consisting of two microservices (frontend and backend) running as containers. This application provides Star Wars fans the ability to:

- View detailed information about **People** and **Planets**.
- Sort and search through the information.
- Enjoy exploring Star Wars data in an interactive way.

## Features
### Acceptance Criteria
1. **Display Information**: The application displays data retrieved from SWAPI in a web browser.
2. **Data Sources**:
   - People endpoint.
   - Planets endpoint.
3. **Pagination**:
   - Each table displays 15 items per page.
4. **Search**:
   - Case-insensitive partial match filtering by name for both tables.
   - Example: Searching for "sky" in the **People** table should return "Luke Skywalker."
5. **Sorting**:
   - Sort data by `name` and `created` fields in ascending and descending order.
   - Sorting implemented in the backend following the "Open-closed" principle.
6. **Frontend**:
   - Built with Vue and Vuetify
7. **Backend**:
   - Built using Go
8. **Deployment**:
   - Provide a Docker Compose file to deploy the application on port **6969**.

## Setup Instructions
Follow these steps to run the application from scratch using Docker Compose.

### Prerequisites
- Install [Docker](https://www.docker.com/).
- Install [Docker Compose](https://docs.docker.com/compose/).
- Ensure port **6969** is available on your system.

### Steps to Run
1. Clone the repository:
   ```bash
   git clone https://github.com/jv3ga/MBGSM-swtable.git
   cd swtable
   ```
2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
3. Access the application:
   - Open your browser and navigate to `http://localhost:6969`.

### Project Structure
- **Frontend**: A JavaScript framework-based application that provides the UI for viewing, searching, and sorting the data.
- **Backend**: A RESTful service built with Go or Java to interact with SWAPI and handle sorting logic.
- **Docker Compose**: Manages deployment of frontend and backend microservices as containers.

### Configuration
- The Docker Compose file is pre-configured to deploy the application on port **6969**. If needed, modify the `.env` file to change port mappings.
- If needed, modify the variable `BASE_URL` in the `.env` file to change URL of the Star Wars API (SWAPI)

### Integration Tests
To run the integration tests, execute:
```bash
# Navigate to the frontend test directory
cd frontend
# Run tests
npm run test
```

```bash
# Navigate to the backend directory
cd backend
# Run tests
go test ./...
```

Ensure all tests pass before deployment.

## Evaluation Criteria
- Adherence to software engineering principles.
- Clean and intuitive UX/UI design.
- API performance.
- High-quality, clean, and maintainable code.

## Scalability example

Checkout the branch `species_example`, you can have another fully functional tab with other data just doing:

- Adding `species` endpoint to the backend
- Adding key to the `swTable` object on the frontend



## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
Special thanks to the creators of SWAPI for providing a fantastic Star Wars API. Enjoy exploring the galaxy far, far away!

