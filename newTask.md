# YOLab Analytics System: Lean MVP Strategy

## Part 1: Backend Architecture & Instructions

The core philosophy of this backend is **Aggregated Counting over Event Logging**. Instead of writing a new database row for every single user action, the system will update a daily tally. This prevents database bloat and ensures immediate API response times.

### 1. Database Schema Design
You will need exactly two collections/tables:

*   **`DailyStats` (The Counter Table):**
    *   **Structure:** One document/row per calendar day.
    *   **Primary Key/Index:** The date string (e.g., `YYYY-MM-DD`).
    *   **Fields:** Integer counters for `newUsers`, `activeUsers`, `projectsCreated`, and a nested object for `serviceUsage` (counters for `qrGenerator`, `apiMocker`, `codeGenerator`, `imageTools`).
*   **`ActivityFeed` (The Audit Log):**
    *   **Structure:** A fixed-size or capped collection (e.g., limited to the latest 50-100 entries) to prevent endless growth.
    *   **Fields:** `timestamp` (Date), `actionName` (String), and `userIdentifier` (String - email or ID).

### 2. Data Tracking Logic
*   **Atomic Updates:** When an event occurs (e.g., a user generates a QR code), the backend must issue an "upsert" command to the `DailyStats` collection for the current date. It should atomically increment (`+1`) the specific counter.
*   **Fire-and-Forget:** Analytics tracking should not block the main user request. Trigger the analytics database update asynchronously so the user doesn't wait for the analytics write to finish.
*   **Active Users Cache:** To track daily active users without duplicates, maintain a temporary cache (like a Redis set or a simple in-memory Map) of User IDs who have logged in today. Only increment the `activeUsers` database counter if the ID is not already in today's cache.

### 3. API Endpoints Required
Build two secure, admin-only routes:

*   **`GET /api/admin/analytics/summary`**
    *   **Behavior:** Fetches today's `DailyStats` document AND aggregates the historical totals (e.g., summing all `newUsers` across all time). 
    *   **Response Payload:** Total platform counts, today's specific counts, and the aggregated service usage numbers.
*   **`GET /api/admin/analytics/feed`**
    *   **Behavior:** Fetches the most recent entries from the `ActivityFeed` collection, sorted by newest first.

---

## Part 2: Frontend Component Structure

The frontend should be a single, scrollable view using functional components. No complex routing, no tabs, and no heavy charting libraries.

### 1. Component Hierarchy

```text
<AnalyticsDashboard>
  <DashboardHeader/>
  <MetricCardsGrid>
    <StatCard/> (x4)
  </MetricCardsGrid>
  <DashboardBody>
    <ServicePopularityPanel/>
    <RecentActivityPanel/>
  </DashboardBody>
</AnalyticsDashboard>

========================================================
[ Title: Analytics ]                    [ Refresh Button ]
========================================================

+--------------------+  +------------------------------+
| Total Users        |  | Active Users (Today)         |
| 1,204              |  | 42                           |
+--------------------+  +------------------------------+
| Total Projects     |  | Total API Calls (Today)      |
| 350                |  | 1,024                        |
+--------------------+  +------------------------------+

========================================================
SERVICE USAGE (All Time)
========================================================
QR Generator    [████████████████████████      ] 4,200
API Mocker      [█████████████                 ] 2,150
Code Generator  [██████                        ] 1,100
Image Tools     [██                            ] 450

========================================================
RECENT ACTIVITY (Last 50 Events)
========================================================
[10:45 AM] user1@mail.com used QR Generator
[10:42 AM] System: New User Registered (user2@mail.com)
[10:15 AM] user3@mail.com created project 'Alpha'
[09:50 AM] user1@mail.com used API Mocker
========================================================