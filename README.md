# 🎓 ClassPlus — Real-Time Assignment & Notification Engine

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-v5.2-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%20v9-green.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-v7%2B-red.svg)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-v6.3-orange.svg)](https://bullmq.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.8-blue.svg)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

---

## 🚀 Project Overview

**ClassPlus** is an event-driven, scalable classroom management backend built to solve the **notification fan-out bottleneck** when teachers distribute assignments to large numbers of students.

### 📌 The Problem It Solves
In traditional monolithic backends, when a teacher creates an assignment for hundreds or thousands of students:
- Synchronously querying students, creating individual notification records, and sending push alerts inside the HTTP request loop causes **high latency, timeouts, and server crashes**.
- If a downstream service fails during notification dispatch, the entire assignment creation can fail.

### 💡 The Solution
ClassPlus decouples the ingestion of assignments from notification processing using an asynchronous message queue and real-time pub/sub:
1. **Instant Response**: When a teacher publishes an assignment, it is saved to MongoDB and an event is queued into **BullMQ (Redis)**. The API responds to the teacher immediately with HTTP `201 Created` (< 50ms).
2. **Asynchronous Background Processing**: A dedicated background worker consumes the job from BullMQ, queries all assigned students, creates persistent notification records in MongoDB, and broadcasts events via **Redis Pub/Sub**.
3. **Targeted Real-Time Push**: An API subscriber receives the event from Redis Pub/Sub and uses **Socket.IO** to deliver real-time notifications directly to each student's private WebSocket room (`student:<studentId>`).

---

## 1. System Design (HLD)

```mermaid
graph LR
    Teacher["👨‍🏫 Teacher"] -->|"1. Create Assignment"| API["🌐 Express API Server"]
    API -->|"2. Save Assignment"| MongoDB[("🍃 MongoDB")]
    API -->|"3. Enqueue Job"| RedisQueue["📬 BullMQ Queue (Redis)"]
    
    RedisQueue -->|"4. Pick Job"| Worker["⚙️ Background Worker"]
    Worker -->|"5. Get Students & Save Notifications"| MongoDB
    Worker -->|"6. Publish Event"| RedisPubSub["📡 Redis Pub/Sub"]
    
    RedisPubSub -->|"7. Forward Event"| APISubscriber["📥 API Subscriber"]
    APISubscriber -->|"8. Send to Room"| SocketServer["🔌 Socket.IO"]
    SocketServer -->|"9. Push Notification"| Student["👨‍🎓 Student"]
```

---

## 2. Process Flowchart

```mermaid
flowchart TD
    Start([Start: Teacher posts Assignment]) --> CheckRole{Is user a TEACHER?}
    
    CheckRole -- No --> Reject[Return 400 Error]
    CheckRole -- Yes --> SaveDB[Save Assignment in MongoDB]
    
    SaveDB --> PushQueue[Push Job to BullMQ Queue]
    PushQueue --> ImmediateResponse[Return 201 Created to Teacher]
    
    PushQueue -. Async Processing .-> WorkerPicks[Worker consumes Job from Queue]
    WorkerPicks --> FindStudents[Find all Students assigned to Teacher]
    
    FindStudents --> CheckList{Any students found?}
    CheckList -- No --> EndJob([Done: No notifications needed])
    
    CheckList -- Yes --> ForEach[For each Student]
    ForEach --> SaveNotif[Save Notification record in MongoDB]
    SaveNotif --> PubEvent[Publish event to Redis Pub/Sub]
    PubEvent --> RecvSub[API Subscriber receives event]
    RecvSub --> PushSocket[Socket.IO pushes to student:studentId room]
    PushSocket --> StudentNotified([Student receives Real-Time Alert])
    StudentNotified --> NextStudent{Next student?}
    NextStudent -- Yes --> ForEach
    NextStudent -- No --> EndJob
```
