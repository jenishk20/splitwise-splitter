# Splitwise Splitter

A modern web application that enhances the Splitwise experience by providing advanced group expense management and analytics. Built with Next.js, Express, MongoDB, and AWS Lambda for asynchronous file processing.

## 🌟 Features

### Core Features

- **Splitwise Integration**: Seamlessly connects with your Splitwise account
- **Group Management**: Create and manage expense groups efficiently
- **Expense Tracking**: Detailed tracking of shared expenses
- **Async File Processing**:
  - AWS Lambda-powered file processing
  - Efficient handling of large file uploads
  - Automatic receipt data extraction
  - Background processing status tracking
- **Job Processing**: Background task handling for better performance

### Admin Dashboard

- **User Analytics**: Track user registration and growth
- **Bug Tracking**: Centralized system for bug reports and management
- **User Management**: Comprehensive user data visualization
- **File Processing Monitoring**: Track status of file processing jobs

## 🚀 Tech Stack

### Frontend

- Next.js 13+ (React Framework)
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- Lucide Icons

### Backend

- Express.js
- MongoDB
- JWT Authentication
- Cookie-based Sessions

### Cloud Infrastructure

- **AWS Lambda**: Serverless file processing
- **AWS S3**: File storage
- **AWS CloudWatch**: Lambda function monitoring
- **AWS IAM**: Security and access management

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- MongoDB
- npm or yarn
- Splitwise Developer Account
- AWS Account with appropriate permissions

## 💻 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/splitwise-splitter.git
   cd splitwise-splitter
   ```

2. **Set up environment variables**

   Create `.env` file in the backend directory:

   ```env
   PORT=3001
   MONGODB_URI=your_mongodb_uri
   FRONTEND_URL=http://localhost:3000

   # AWS Configuration
   AWS_REGION=your_aws_region
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET=your_bucket_name
   AWS_LAMBDA_FUNCTION=your_lambda_function_name
   ```

3. **Install dependencies**

   Frontend:

   ```bash
   cd app
   npm install
   ```

   Backend:

   ```bash
   cd backend
   npm install
   ```

4. **Start the development servers**

   Frontend:

   ```bash
   npm run dev
   ```

   Backend:

   ```bash
   npm run dev
   ```

## 🏗️ AWS Lambda Setup

1. **Create an S3 Bucket**

   - Create a new S3 bucket for file storage
   - Configure CORS for frontend access
   - Set appropriate bucket policies

2. **Create Lambda Function**

   - Create a new Lambda function
   - Configure environment variables
   - Set up IAM roles with necessary permissions:
     - S3 read/write access
     - CloudWatch logs access
     - Any other required AWS services

3. **Configure IAM Roles**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:GetObject", "s3:PutObject"],
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

## 📁 Project Structure
