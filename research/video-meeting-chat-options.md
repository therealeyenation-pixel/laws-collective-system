# Video Meeting & Chat Integration Research

## Overview
Research findings for adding Teams-like video meeting and chat functionality to the LuvOnPurpose system.

## Option 1: Microsoft Teams Integration (via Microsoft Graph API)

### Pros:
- Native Teams experience
- Users already familiar with Teams
- Full chat functionality (create chats, send messages, file attachments)
- Video meetings via Teams
- Enterprise-grade security

### Cons:
- Requires Microsoft 365 licenses for all users
- Complex OAuth setup with Azure AD
- Metered API costs for some features
- Users must have Microsoft accounts
- Not fully embeddable - redirects to Teams

### Requirements:
- Azure AD tenant
- Microsoft Graph API permissions
- Microsoft 365 Business licenses
- OAuth 2.0 authentication flow

### Architecture:
1. Chat UI - makes API requests to Teams APIs
2. Server component - subscribes to change notifications
3. Cache - stores messages to minimize API calls

---

## Option 2: Daily.co (Recommended for Video)

### Pros:
- Easy to integrate (few lines of code)
- Prebuilt video call UI available
- Custom SDK for full control
- WebRTC-based (browser native)
- 10,000 free minutes/month
- Works across web and mobile

### Cons:
- Separate service from chat
- Monthly costs after free tier
- No built-in chat (video only)

### Pricing:
- Free: 10,000 participant minutes/month
- Pay-as-you-go after that

---

## Option 3: 100ms.live

### Pros:
- Video conferencing + live streaming
- 10,000 free minutes/month
- Easy SDK integration
- Good documentation

### Cons:
- Similar to Daily.co
- No built-in persistent chat

---

## Option 4: Twilio Video

### Pros:
- Mature platform
- Good documentation
- Programmable video SDK
- Works on web, iOS, Android

### Cons:
- More expensive
- Complex pricing model
- No built-in chat (separate Twilio Conversations)

---

## Option 5: Build Custom with WebRTC + Socket.io

### Pros:
- Full control
- No external dependencies
- No per-minute costs
- Can integrate chat natively

### Cons:
- Complex to build
- Need TURN/STUN servers
- Scaling challenges
- More development time

---

## Recommended Approach

### For Quick Implementation:
1. **Video Meetings**: Daily.co Prebuilt
   - Embed video calls with minimal code
   - Schedule meetings via API
   - Store meeting links in database

2. **Chat**: Build custom with existing infrastructure
   - Use existing tRPC + database
   - Real-time updates via polling or WebSocket
   - Store messages in MySQL

### For Full Teams Integration:
1. Use Microsoft Graph API for chat
2. Use Azure Communication Services for video
3. Requires Microsoft 365 licensing

---

## Implementation Plan

### Phase 1: Meeting Scheduling
- Create meetings table in database
- Schedule meetings with date/time/participants
- Generate meeting links (Daily.co or custom)
- Send calendar invites/notifications

### Phase 2: Video Integration
- Integrate Daily.co Prebuilt for video
- Create meeting room on demand
- Join meeting from dashboard

### Phase 3: Chat System
- Create chat/message tables
- Real-time messaging with tRPC subscriptions
- Direct messages and group chats
- File attachments via S3

### Phase 4: Teams Integration (Optional)
- Microsoft Graph API for Teams users
- Sync messages with Teams
- Create Teams meetings from app
