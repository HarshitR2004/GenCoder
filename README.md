# GenCoder

A modern coding challenge platform designed for algorithmic problem solving and programming skill development. GenCoder provides an interactive environment where users can solve coding problems across multiple programming languages with real-time code execution and automated testing.

## Overview

GenCoder is a full-stack web application that enables users to practice coding problems, submit solutions, and receive immediate feedback through an integrated judge system. The platform supports multiple programming languages and provides a comprehensive development environment with syntax highlighting, code completion, and instant test case validation.

## Tech Stack

### Backend
- **Framework**: Django 4.x with Django REST Framework
- **Database**: SQLite (development)
- **Authentication**: Token-based authentication with Django's built-in user system
- **API**: RESTful API architecture with comprehensive endpoints
- **Code Execution**: Custom judge system with Docker containerization support

### Frontend
- **Framework**: React 18 with modern hooks and functional components
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with DaisyUI components
- **Code Editor**: Monaco Editor (VS Code engine) with multi-language support
- **State Management**: React Context API with custom hooks
- **Routing**: React Router for client-side navigation

### Development Tools
- **Package Management**: npm for frontend, pip for backend
- **Code Quality**: ESLint for JavaScript, Python standard linting
- **Development Server**: Vite dev server with hot module replacement
- **API Testing**: Built-in test suites and validation

### Judge System
- **Languages Supported**: Python 3.12, Java 11, C++ 11
- **Execution Environment**: Isolated execution with configurable timeouts
- **Template System**: Flexible wrapper templates for different problem types
- **Analysis Engine**: Automatic problem type detection from function signatures

## Features

### Core Functionality

**Problem Management**
- Create and manage coding problems with rich markdown descriptions
- Support for multiple difficulty levels (Easy, Medium, Hard)
- Categorization system with topics and tags
- Comprehensive test case management with example and hidden cases

**Multi-Language Support**
- Python, Java, and C++ support with proper syntax highlighting
- Language-specific starter code templates
- Automatic problem type detection and template generation
- Consistent execution environment across all languages

**Interactive Code Editor**
- Monaco Editor integration with IntelliSense support
- Multiple themes (VS Dark, Light, High Contrast)
- Real-time syntax validation and error highlighting
- Code completion and snippet support

**Real-Time Execution**
- Instant code compilation and execution
- Comprehensive test case validation
- Detailed output comparison with expected results
- Performance metrics including execution time and memory usage

### Advanced Features

**Intelligent Problem Analysis**
- Automatic problem type detection from function signatures
- AST parsing and regex pattern matching for accurate classification
- Quality analysis with improvement suggestions
- Cross-language signature validation

**Admin Interface**
- Comprehensive question management system
- User administration and role-based access control
- Analytics and usage statistics
- Bulk operations for content management

**User Experience**
- Responsive design optimized for desktop and mobile
- Dark/light theme support with system preference detection
- Intuitive navigation with breadcrumbs and search functionality
- Real-time feedback and validation

**Testing and Validation**
- Comprehensive test case execution with detailed results
- Input/output validation with diff highlighting
- Performance benchmarking and resource monitoring
- Error handling with detailed debugging information

## Architecture

### Backend Architecture
```
GenCoder Backend
├── gencoder/           # Main Django project
├── questions/          # Question management app
├── testcase/          # Test case management
├── users/             # User authentication and profiles
├── utils/             # Utility modules
│   ├── judge/         # Code execution engine
│   └── storage/       # File storage utilities
└── manage.py          # Django management script
```

### Frontend Architecture
```
Frontend Application
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Route-specific page components
│   ├── contexts/      # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API service modules
│   └── utils/         # Helper functions
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

### Judge System Architecture
```
Judge System
├── wrappers/          # Language-specific execution templates
│   ├── python/        # Python execution wrappers
│   ├── java/          # Java execution wrappers
│   └── cpp/           # C++ execution wrappers
├── Judge.py           # Main judge orchestration
└── analysis/          # Code analysis modules
```

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User authentication
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/user/` - Get current user info

### Questions
- `GET /api/questions/` - List all questions with pagination
- `GET /api/questions/{id}/` - Get specific question details
- `POST /api/questions/` - Create new question (admin only)
- `PUT /api/questions/{id}/` - Update question (admin only)
- `DELETE /api/questions/{id}/` - Delete question (admin only)

### Code Execution
- `POST /api/judge/execute/` - Execute code against test cases
- `POST /api/analyze-starter-code/` - Analyze function signatures
- `POST /api/validate-problem-type/` - Validate problem type compatibility

### Test Cases
- `GET /api/questions/{id}/testcases/` - Get question test cases
- `POST /api/testcases/` - Create test case (admin only)
- `PUT /api/testcases/{id}/` - Update test case (admin only)

## Database Schema

### Core Models

**Question Model**
- ID, title, difficulty level, markdown content
- Starter code for multiple languages
- Problem type classification
- Creation and modification timestamps
- Topic associations and metadata

**TestCase Model**
- Input and expected output content
- Example/hidden case classification
- Association with parent question
- Validation and ordering information

**User Model**
- Extended Django user with additional fields
- Role-based permissions (user/admin)
- Profile information and preferences
- Activity tracking and statistics

**Topic Model**
- Categorization system for questions
- Hierarchical topic organization
- Usage statistics and metadata

## Problem Types

The platform supports automatic detection and classification of different problem types:

### Function-Only Integer
- **Signature**: `solution(a: int, b: int) -> int`
- **Use Cases**: Mathematical operations, arithmetic problems
- **Example**: Add two numbers, find GCD, calculate factorial

### Function-Only Array
- **Signature**: `solution(nums: List[int]) -> int`
- **Use Cases**: Array manipulation, sorting algorithms, search problems
- **Example**: Find maximum element, sort array, binary search

### Function-Only String
- **Signature**: `solution(word: str) -> str`
- **Use Cases**: Text processing, string manipulation, pattern matching
- **Example**: Reverse string, check palindrome, count vowels

## Development Setup

### Prerequisites
- Python 3.11 or higher
- Node.js 16 or higher
- npm or yarn package manager

### Backend Setup
```bash
# Navigate to project directory
cd GenCoder

# Create virtual environment
python -m venv .

# Activate virtual environment
# Windows:
Scripts\activate
# macOS/Linux:
source bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Judge System Setup
The judge system requires proper configuration of execution environments:

```bash
# Test judge system
python test_starter_code_analysis.py

# Verify language support
python utils/judge/test_judge.py
```

## Environment Configuration

### Backend Environment Variables
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_JUDGE_SERVICE_URL=http://localhost:2000
```

## Deployment

### Production Deployment

**Backend Deployment**
- Configure production database (PostgreSQL recommended)
- Set up static file serving with whitenoise or CDN
- Configure CORS settings for production domains
- Set up proper logging and monitoring

**Frontend Deployment**
- Build optimized production bundle
- Configure API endpoints for production
- Set up CDN for static asset delivery
- Configure proper caching headers

**Judge Service Deployment**
- Set up isolated execution environment
- Configure resource limits and timeouts
- Implement proper security sandboxing
- Set up monitoring and logging

### Docker Deployment
The application can be containerized for consistent deployment:

```dockerfile
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

## Testing

### Backend Testing
```bash
# Run Django tests
python manage.py test

# Run specific test modules
python manage.py test questions.tests
python manage.py test utils.judge.tests
```

### Frontend Testing
```bash
# Run component tests
npm run test

# Run end-to-end tests
npm run test:e2e
```

### Judge System Testing
```bash
# Test code analysis
python test_starter_code_analysis.py

# Test execution engine
python utils/judge/test_execution.py
```

## Performance Optimization

### Backend Optimization
- Database query optimization with select_related and prefetch_related
- Caching with Redis for frequently accessed data
- API pagination for large datasets
- Background task processing for code execution

### Frontend Optimization
- Code splitting and lazy loading for route components
- Monaco Editor lazy loading and worker optimization
- Image optimization and compression
- Bundle size optimization with tree shaking

### Judge System Optimization
- Execution environment pooling for faster startup
- Template caching for frequently used patterns
- Resource monitoring and automatic scaling
- Queue management for concurrent executions

## Security Considerations

### Backend Security
- CSRF protection enabled by default
- SQL injection prevention through ORM
- Authentication token management
- Input validation and sanitization

### Frontend Security
- XSS protection through React's built-in escaping
- Secure API communication over HTTPS
- Content Security Policy implementation
- Dependency vulnerability scanning

### Judge System Security
- Sandboxed code execution environment
- Resource limits to prevent abuse
- Input validation for all execution requests
- Timeout mechanisms for long-running code

## Monitoring and Analytics

### Application Monitoring
- Real-time performance metrics
- Error tracking and reporting
- User activity analytics
- Resource usage monitoring

### Judge System Monitoring
- Execution time tracking
- Memory usage analysis
- Success/failure rate monitoring
- Queue length and processing time metrics

## Troubleshooting

### Common Issues

**Database Connection Issues**
- Verify database configuration in settings
- Check migration status with `python manage.py showmigrations`
- Ensure proper database permissions

**Frontend Build Issues**
- Clear node_modules and reinstall dependencies
- Verify Node.js version compatibility
- Check for conflicting global packages

**Judge System Issues**
- Verify execution environment setup
- Check file permissions for wrapper templates
- Validate timeout and memory limit configurations

### Debug Mode
Enable debug logging for detailed troubleshooting:

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## Future Enhancements

### Planned Features
- Support for additional programming languages (JavaScript, Rust, Go)
- Advanced analytics dashboard with detailed metrics
- Real-time collaborative coding sessions
- Integration with external judge systems
- Mobile application for iOS and Android
- Competitive programming contest support
- Advanced user progress tracking and achievements

### Technical Improvements
- Microservices architecture for better scalability
- GraphQL API for more efficient data fetching
- Advanced caching strategies with Redis
- Machine learning-based problem recommendations
- Automated difficulty assessment for problems
- Enhanced security with OAuth2 integration
