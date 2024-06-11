# Getting started

Before starting, make sure you have at least those components on your workstation:

- An up-to-date release of NodeJS such as 18.x and NPM
- A database such as PostgreSQL and Redis. You may use the provided docker-compose.yml file.

<a href="https://www.docker.com/">Docker</a> may also be useful for advanced testing and image building, although it is not required for development.

## Project Configuration

To clone the repository, run the following command:

```json
git clone https://github.com/SergeiiKalina/test-task-comments .
```

# then

```json

npm install

```

### Launch and discover.

You are now ready to launch the our application with docker-compose.yml using the command below.

```json

docker-compose up

```

# Since there was no swagger documentation in the requirements I will describe the endpoints here.

# Registration

```json
POST /auth

{
  "email": "example@example.com",
  "userName": "Name",
  "homePage": "https://example.com" (optional field)
}

```

# Login

```json
POST /auth/login

{
  "email": "example@example.com",
  "userName": "Name",
}
Example request:
{
  "id": "12345",
  "email": "example@example.com",
  "userName": "Name",
  "homePage": "https://example.com",
  "token": "jwt-token-here"
}


```

## WebSocket API

### Gateway Overview

This project includes a WebSocket gateway that handles real-time communication for comments. The gateway is set up to handle connections, disconnections, and specific events such as adding comments and retrieving sorted comments.

### WebSocket Events

#### Connection

Clients can connect to the WebSocket gateway using a WebSocket client. Upon successful connection, a message will be logged on the server.

#### Disconnection

When a client disconnects, the server will remove any cached sort parameters associated with the client.

#### Exception

**Event:** `exception`

**Description:** Return all exception in project

### Events and Payloads

#### Get First Page

**Event:** `getFirstPage`

**Description:** Return last 25 comments

#### Add Comments

**Event:** `addComments`

**Description:** This event is used to add a new comment. It uses JWT and ReCAPTCHA for security and handles file uploads. The field can include html tags (a, code, i, strong), but all other tags will be removed. Pictures will be cut to 320x240 size and .txt files > 100kb will give an error.

**Payload:**

```json
{
  "text": "This is a comment can include text or html tags such us (<a href=”” title=””> </a> <code> </code> <i> </i> <strong> </strong>
)",
"parent": "id or null  (if null this will be main comments and if this will be id another comment this will be answer)",
  "file": "<file>" "(picture(size not limited) or txt file (size limited to 100kb))",
  "recaptcha": "token"
}
```

**Payload Authorization**

```json
{
  "extraHeaders": {
    "Authorization": "Bearer token"
  }
}
```

#### Get Sorted Comments

**Event:** `getSortedComments`

**Description:** This event is used to sort comments there is no protection here JWT and ReCAPTCHA

**Payload:**

```json
{
  "field": "the field by which the sorting will be done ('createdAt', 'email', 'userName')",
  "order": "ascending or descending ('ASC', 'DESC')",
  "page": "page by account"
}
```

# Project structure

```json
src/
├── auth
│ ├── auth.module.ts
| ├── auth.controller.ts
| ├── auth.service.ts
│ ├── dto/
| | └── createUser.dto.ts
│ ├── entities/
| | └── user.entity.ts
│ ├── guards/
| | └── captcha.guard.ts
| | └── jwt.guard.ts
├── comment
│ ├── comment.module.ts
| ├── comment.gateway.ts
| ├── comment.service.ts
| ├── comment.controller.ts
| ├── comment-event-handler.ts
│ ├── cache/
| | └── cache.service.ts
│ ├── dto/
| | └── create-comment.dto.ts
| | └── sorted.dto.ts
│ ├── entities/
| | └── comment.entity.ts
│ ├── file/
| | └── file.service.ts
│ ├── interceptors/
| | └── file.interceptor.ts
│ ├── interface/
| | └── comment.interface.ts
│ ├── pipes/
| | └── sharp.pipe.ts
| | └── validate-html.pipe.ts
├── queue
│ ├── comment.processor.ts
| ├── queue-comment.service.ts
| ├── queue.module.ts
├──app.controller.ts
├──app.module.ts
├──app.service.ts
└── main.ts
```

# Project goals

## Comment System Project

### General Project Goals

The Comment System project aims to create a functional comment system that allows comments to be consumed, responded to, and interacted with in a time-sensitive manner. The system is designed to be portable to web applications and provides the following educational capabilities:

1. **Comment Creation and Management**

- Users can leave comments on specific topics or posts.
- Comments can contain text and attached files (images or text files). - Users can reply to existing comments by suggesting a comment tree.

2. **Authentication and Security**

- Support for JWT authentication to protect access to the commenting functionality.
- Integration with Google ReCAPTCHA to protect against spam and bots.
- Security measures for file handling to avoid malicious downloads.

3. **Real Time**

- Use of WebSocket to ensure instant comment updates without the need to reload the page.
- Handle time-based events such as adding new comments and retrieving sorted comments.

4. **Caching and Performance**

- Use cache to optimize performance and reduce server load on repeated requests.
- Manage sorting parameters and result caching to improve data access speed.

5. **Queues and Asynchronous Processing**

- Integrate with Bull to manage task queues such as comment and file processing.
- Ensure system reliability and resilience through asynchronous processing.
