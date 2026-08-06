# OnePic - Image Processing Service

## Overview

**OnePic** is YOLAB's dedicated image processing service. It is designed as an independent Python microservice responsible only for image processing operations, while the main **YOLAB Node.js backend** handles authentication, authorization, business logic, and communication with clients.

This separation keeps the architecture modular, secure, and easy to extend with future AI-powered features.

---

# Architecture

```
                User
                  │
                  ▼
        React Frontend (YOLAB)
                  │
            JWT Authentication
                  │
                  ▼
        Node.js Backend (API Gateway)
        ├── Authentication
        ├── Authorization
        ├── Validation
        ├── Rate Limiting
        ├── Logging
        ├── File Upload
        ├── Business Logic
        └── Processing History
                  │
        Internal HTTP Request
                  │
                  ▼
      OnePic (Python + FastAPI)
        ├── Image Enhancement
        ├── Edge Detection
        ├── Image Transformations
        └── Future AI Services
```

---

# Design Principles

## Node.js Backend Responsibilities

The Node.js backend is the single entry point for all client requests.

Responsibilities include:

* User Authentication (JWT)
* Authorization
* Request Validation
* Rate Limiting
* File Upload Handling
* Logging
* Usage Tracking
* Processing History
* Calling OnePic service
* Returning processed images

---

## OnePic Responsibilities

The OnePic service focuses only on image processing.

It does **not** manage:

* Authentication
* User Accounts
* Sessions
* Database
* Permissions
* Business Logic

Its only responsibility is:

> Receive an image and processing parameters, perform the requested operation, and return the processed image.

---

# Request Flow

```
User

↓

React Frontend

↓

Node.js Backend

↓

Verify JWT

↓

Validate Request

↓

Forward Image to OnePic

↓

Process Image

↓

Return Processed Image

↓

React Frontend
```

The frontend **never communicates directly** with the Python service.

---

# Why This Architecture?

## Single Authentication System

Authentication is handled only once in the Node.js backend.

Benefits:

* No duplicate JWT verification
* Centralized security
* Easier maintenance
* Consistent authorization

---

## Separation of Concerns

### Node.js

* User management
* APIs
* Business rules
* Logging
* Storage
* Billing (future)

### OnePic

* Image processing
* Computer vision algorithms
* Future AI inference

Each service has a single responsibility.

---

## Security

The OnePic service is **private** and is not exposed to the internet.

```
Internet

↓

Node.js Backend

↓

Private Network

↓

OnePic
```

Only the Node.js backend can communicate with OnePic.

---

## Scalability

As YOLAB grows, more services can be added without changing the frontend.

Example:

```
Node Backend

├── OnePic
├── OCR Service
├── AI Generation Service
├── Video Processing Service
├── Background Removal Service
└── ML Inference Service
```

Each service remains independent and can scale separately.

---

# Communication

The Node.js backend communicates with OnePic using internal REST APIs.

Example:

```
POST /enhancement/gaussian
```

The Python service returns the processed image to Node.js, which then sends it back to the client.

---

# Phase 1 Features (done it right now)

### Image Enhancement

* Gaussian Blur
* Median Filter
* Sharpening
* Histogram Equalization

---

# Phase 2 Features

### Edge Detection

* Sobel
* Prewitt
* Laplacian
* Canny

---

# Phase 3 Features

### Image Transformations

* Convolution
* Thresholding
* Scaling
* Rotation
* Contrast Adjustment
* Discrete Fourier Transform (DFT)

---

# Future Roadmap

Planned AI-powered capabilities include:

* Background Removal
* Super Resolution
* OCR
* Object Detection
* Image Segmentation
* Face Detection
* Image Captioning
* Image Inpainting
* Cartoon & Sketch Effects
* Batch Processing
* Processing History
* Cloud Storage Integration

---

# Development Guidelines

* The frontend communicates **only** with the Node.js backend.
* The Node.js backend is the **single API gateway**.
* OnePic must remain **stateless** and focused on image processing.
* Do not implement authentication or user management inside OnePic.
* Keep all image processing algorithms modular and reusable.
* New processing algorithms should be added as independent service modules to simplify testing and future expansion.
