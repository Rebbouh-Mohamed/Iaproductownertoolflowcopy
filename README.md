
  # IA Product Owner Tool Flow (Copy)

This project is an intelligent tool designed to assist Product Owners, Business Analysts, and Product teams in transforming unstructured project descriptions into complete, coherent Agile specifications (User Stories, Features, etc.). It leverages AI to automate and enhance the product design process.

## 🚀 Project Overview

The **IA Product Owner Tool** guides users through a structured workflow to define their product, from the initial vision to actionable user stories and test cases. It aims to save time on functional writing while improving the quality and consistency of specifications.

## 🛠 Tech Stack

### Frontend
- **React** (with TypeScript)
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **Shadcn UI** (UI Components)

### Backend
- **Django** (Python Web Framework)
- **Django REST Framework** (API)
- **LangChain** (AI Orchestration)
- **Ollama** (Local LLM Inference, using `qwen3:8b`)

## 📂 Project Structure

The project is organized into a frontend-backend monorepo structure:

### Backend (`/`)
- **`core/`**: Handles user authentication and core user models (`CustomUser`).
- **`projects/`**: Manages project metadata (`Project`, `ProjectType`).
- **`features/`**: Handles the core product artifacts including:
  - `ProductVision`: AI-generated vision statements.
  - `ProjectDesc`: Detailed project descriptions.
  - `Feature` & `PreFeature`: Feature suggestions and management.
- **`rag/`**: Contains the AI logic (`agent.py`) using LangChain and Ollama to generate content based on project context.
- **`prod_copilot/`**: Main Django project configuration.

### Frontend (`src/`)
- **`components/`**: Reusable UI components.
  - **`steps/`**: Contains the main workflow steps of the application (e.g., `ProductVisionStep`, `FeaturesStep`, `KanbanSprintStep`).
  - **`ui/`**: Shadcn UI components.
  - **`pages/`**: Main application pages (`LoginPage`, `ProjectsPage`, etc.).
- **`services/`**: API client services for communicating with the Django backend.
- **`types/`**: TypeScript type definitions.

## ✨ Main Functionalities

The application follows a step-by-step workflow to build a product specification:

1.  **Authentication**: Secure email-based login and signup.
2.  **Project Management**: Create and manage multiple projects with different types (Web, Mobile, etc.).
3.  **Project Builder Workflow**:
    *   **Project Description**: Input the initial project details and scope.
    *   **Product Vision**: Answer strategic questions to generate a comprehensive product vision using AI.
    *   **Features**:
        *   View pre-defined feature templates based on project type.
        *   Generate new feature suggestions using AI.
        *   Manually add custom features.
    *   **User Flow**: Define the user journey through the application.
    *   **Planning**: Organize features into a roadmap.
    *   **Kanban Sprint**: Manage tasks in an Agile board format.
    *   **Test Cases**: Automatically generate acceptance criteria and test cases.
    *   **Export**: Export the generated documentation and artifacts.

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js & npm
- Python 3.8+
- Ollama (running locally with `qwen3:8b` model)

### Backend Setup
1.  Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run migrations:
    ```bash
    python manage.py migrate
    ```
4.  Start the server:
    ```bash
    python manage.py runserver
    ```

### Frontend Setup
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```

## 🤖 AI Configuration
Ensure you have Ollama installed and the model pulled:
```bash
ollama pull qwen3:8b
```
The AI agent logic is located in `rag/agent.py` and can be customized to use different models or prompts.
  