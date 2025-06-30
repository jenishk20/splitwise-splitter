# SplitMate – AI Powered Expense Splitter

_Infinitely Scalable Serverless System for Receipt Parsing and Group Expense Management_

SplitMate is a modern web application that transforms how groups split bills. Whether you're managing groceries, dining out, or any shared expense, SplitMate uses AI and serverless infrastructure to automatically parse receipts, handle opt-in logic, and finalize splits via Splitwise.

> Built on an event-driven, serverless architecture that scales effortlessly using AWS Lambda, S3, and SQS.

---

## Features

### Core

- **AI-Driven Receipt Parsing**: Upload an invoice → Claude Vision (via Amazon Bedrock) extracts items → Group members opt-in/out → Final split on Splitwise.
- **Infinitely Scalable Backend**: Async, event-driven pipeline using AWS Lambda, SQS, and S3.
- **Job Queuing System**: Background tasks decoupled via SQS for high-throughput workloads.
- **Real-Time Status Tracking**: MongoDB keeps track of parsing progress and completion.
- **Opt-In Based Splits**: Every group member sees parsed items and marks what they consumed.

### Admin Dashboard

- User analytics and activity
- File processing logs
- Bug reporting and resolution tracking

---

## Serverless Architecture Overview

### Backend Powerhouse (AI Parsing Pipeline)

1. **Upload Invoice**  
   Frontend receives a signed S3 URL from a Lambda function and uploads the invoice image.

2. **S3 Trigger**  
   S3 triggers a Lambda (`s3-to-sqs-dispatcher`) which sends a message to SQS (decouples upload from processing).

3. **SQS Consumer Lambda**  
   Another Lambda (`invoice-processor`) polls SQS → fetches the image from S3 → sends it to Claude via Amazon Bedrock.

4. **Parsing & Storage**  
   Claude responds with structured JSON → Result is saved in MongoDB and marked as `Done`.

### Flow Diagram ( Generated from User Flow and Business Logic )

![Flow Diagram](https://resume-jenish.s3.us-east-1.amazonaws.com/image.png)

### Architecture Diagram ( Generated from Cloudformation Template )

![Architecture](https://resume-jenish.s3.us-east-1.amazonaws.com/Architecture.png)

---

## Tech Stack

### Frontend

- Next.js 13+
- Tailwind CSS + Shadcn UI
- Lucide Icons

### Backend

- ExpressJS API (deployed on Render)
- MongoDB Atlas
- AWS Lambda for asynchronous job processing
- S3 for file storage
- SQS for decoupling uploads and processing
- Bedrock Claude for image parsing

---

## AWS Lambda & Layers

- **upload-handler** – Generates signed S3 upload URLs
- **s3-to-sqs-dispatcher** – Triggered on image upload to S3; sends job info to SQS
- **invoice-processor** – Polls SQS, retrieves image, calls Claude, updates MongoDB

### Lambda Layers

- **MongoDB Layer**: Reusable DB access logic
- **Bedrock SDK Layer**: Encapsulates image + prompt inference logic for Claude

---

## Challenges We Ran Into

- Understanding and formatting Bedrock payloads for image-based inference
- Handling S3 event listener conflicts when multiple Lambdas target the same bucket
- CloudFormation rollbacks when buckets weren't empty or had conflicting configs

---

## Accomplishments

- Built a cleanly decoupled and infinitely scalable MVP
- Integrated Claude Vision in production-grade workflow
- Enabled real-time item opt-in/out per user with backend sync

---

## What We Learned

- Building event-driven serverless apps with AWS Lambda, SQS, S3
- Secret management using AWS SecretsManager
- Bedrock Claude 3 Vision usage for multimodal inference
- Async job orchestration in production-like environments

---

## What's Next

- Build a mobile version with camera-based invoice uploads
- Add item-level heuristics (weights, discounts, etc.) to improve splitting logic
- Implement audit trails and confirmation flows for group members

---
