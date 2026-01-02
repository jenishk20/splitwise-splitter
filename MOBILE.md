# 📱 SplitMate Mobile Application - Development Plan

## Overview

This document outlines the development plan for building a mobile application for **SplitMate** - an AI-powered expense splitting application. The mobile app will extend the existing web application to provide a native mobile experience for iOS and Android platforms.

## 🎯 Project Goals

- **Primary Goal**: Create a cross-platform mobile app that replicates core SplitMate functionality
- **Learning Goal**: Learn mobile app development from scratch using modern tools
- **Timeline**: 6-8 weeks for MVP, 10-12 weeks for full feature parity

## 🛠️ Technology Stack Decision

### **React Native + Expo** ✅ (Selected)

**Why React Native with Expo?**

1. **Leverage Existing Skills**: You already know React and TypeScript from your Next.js web app
2. **Code Reusability**: Can share business logic, API calls, and utilities between web and mobile
3. **Faster Development**: Expo handles native builds, deployment, and over-the-air updates
4. **Cross-Platform**: One codebase for both iOS and Android
5. **Great Developer Experience**: Hot reload, excellent documentation, large community
6. **No Native Code Required**: Expo abstracts away iOS/Android native code complexity

**Alternatives Considered:**

- **Flutter**: Would require learning Dart, but excellent performance
- **Native (Swift/Kotlin)**: Best performance but requires learning two languages
- **Ionic/Capacitor**: Web-based, but less native feel

## 📋 Development Phases

### **Phase 1: Foundation & Learning (Weeks 1-2)**

**Objectives:**

- Set up development environment
- Learn React Native fundamentals
- Understand mobile app architecture
- Build basic UI components

**Deliverables:**

- ✅ Development environment configured
- ✅ Basic app structure with navigation
- ✅ Understanding of React Native components
- ✅ Simple screens (login, home, profile)

**Learning Focus:**

- React Native core concepts (View, Text, ScrollView, etc.)
- Expo development workflow
- Mobile navigation patterns
- Styling with StyleSheet API

**Resources:**

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- Expo tutorials and examples

---

### **Phase 2: Authentication & Backend Integration (Weeks 2-3)**

**Objectives:**

- Implement authentication flow
- Connect to existing backend API
- Handle secure token storage
- Update backend for mobile support

**Deliverables:**

- ✅ Splitwise OAuth integration for mobile
- ✅ Token-based authentication
- ✅ Secure storage implementation
- ✅ Backend API updated for mobile

**Technical Tasks:**

1. **Backend Updates:**

   - Add token-based auth endpoint (currently uses cookies)
   - Update middleware to support both cookies (web) and tokens (mobile)
   - Update CORS to allow mobile app origins

2. **Mobile Implementation:**
   - Implement OAuth flow with deep linking
   - Store tokens securely using `expo-secure-store`
   - Create API client with axios
   - Handle authentication state management

**Learning Focus:**

- Mobile authentication patterns
- Secure storage on mobile devices
- API integration in React Native
- Deep linking and URL schemes

---

### **Phase 3: Core Features - Groups & Navigation (Weeks 3-4)**

**Objectives:**

- Display user groups
- Implement group detail screens
- Add navigation between screens
- Create reusable UI components

**Deliverables:**

- ✅ Groups list screen
- ✅ Group detail screen
- ✅ Navigation flow
- ✅ Basic UI component library

**Features to Build:**

- Groups list with member count
- Group detail view
- Member list display
- Group statistics
- Navigation between groups and expenses

**Learning Focus:**

- React Navigation (Stack, Tabs, Drawer)
- List rendering (FlatList, SectionList)
- Component composition
- State management patterns

---

### **Phase 4: Receipt Upload & Camera Integration (Weeks 4-5)**

**Objectives:**

- Implement camera access
- Add image picker functionality
- Upload receipts to backend
- Show upload progress

**Deliverables:**

- ✅ Camera integration
- ✅ Image picker (gallery)
- ✅ File upload to S3 via backend
- ✅ Upload progress indicators

**Technical Tasks:**

1. **Permissions:**

   - Request camera permissions
   - Request photo library permissions

2. **Image Handling:**

   - Capture photos with camera
   - Select images from gallery
   - Image compression/optimization
   - Preview before upload

3. **Upload:**
   - Convert image to FormData
   - Upload to existing S3 endpoint
   - Handle upload progress
   - Error handling and retry logic

**Learning Focus:**

- Native device APIs (camera, file system)
- File uploads in React Native
- Permission handling
- Image manipulation

---

### **Phase 5: Expense Management (Weeks 5-6)**

**Objectives:**

- Display parsed expenses
- Implement opt-in/opt-out functionality
- Show expense details
- Handle expense finalization

**Deliverables:**

- ✅ Expense list view
- ✅ Expense detail screen
- ✅ Item selection (opt-in/out)
- ✅ Expense finalization to Splitwise

**Features to Build:**

- List of pending expenses
- Expense detail with parsed items
- Toggle items on/off
- Calculate totals dynamically
- Finalize expense button
- Delete expense functionality

**Learning Focus:**

- Complex state management
- Real-time data updates
- Form handling
- Optimistic UI updates

---

### **Phase 6: Real-Time Updates & Job Status (Weeks 6-7)**

**Objectives:**

- Implement real-time job status updates
- Show receipt parsing progress
- Handle job completion notifications
- Add pull-to-refresh

**Deliverables:**

- ✅ Real-time job status updates
- ✅ Progress indicators
- ✅ Push notifications (optional)
- ✅ Refresh mechanisms

**Technical Tasks:**

1. **Real-Time Updates:**

   - Implement Server-Sent Events (SSE) or polling
   - Update UI when job status changes
   - Handle job completion

2. **Notifications:**
   - Local notifications for job completion
   - Push notifications setup (optional)

**Learning Focus:**

- Real-time data synchronization
- Background tasks
- Push notifications
- WebSocket/SSE integration

---

### **Phase 7: UI/UX Polish & Animations (Weeks 7-8)**

**Objectives:**

- Improve visual design
- Add animations and transitions
- Optimize performance
- Enhance user experience

**Deliverables:**

- ✅ Polished UI matching web app design
- ✅ Smooth animations
- ✅ Loading states
- ✅ Error handling UI

**Improvements:**

- Consistent design system
- Loading skeletons
- Error messages
- Success feedback
- Smooth transitions
- Pull-to-refresh
- Swipe gestures

**Learning Focus:**

- React Native animations (Animated API, Reanimated)
- Performance optimization
- UX best practices
- Accessibility

---

### **Phase 8: Testing & Deployment (Weeks 8-10)**

**Objectives:**

- Test on real devices
- Fix bugs and edge cases
- Prepare for app store submission
- Deploy to TestFlight/Play Store (beta)

**Deliverables:**

- ✅ App tested on iOS and Android
- ✅ Bug fixes completed
- ✅ App store assets prepared
- ✅ Beta version deployed

**Tasks:**

1. **Testing:**

   - Test on multiple devices
   - Test on different iOS/Android versions
   - Performance testing
   - User acceptance testing

2. **Deployment:**
   - Build production versions
   - Create app store listings
   - Submit to App Store and Play Store
   - Set up analytics and crash reporting

**Learning Focus:**

- Mobile app testing strategies
- App store submission process
- Code signing
- Release management

---

## 🏗️ Architecture Overview

### **Project Structure**

```
mobile/
├── app/                    # Screens (Expo Router)
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── group/[id]/       # Dynamic routes
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── features/         # Feature-specific components
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom React hooks
├── constants/            # App constants
├── types/                # TypeScript types
└── assets/               # Images, fonts, etc.
```

### **Key Technologies**

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: Expo Router / React Navigation
- **State Management**: React Query (same as web app)
- **API Client**: Axios (same as web app)
- **Storage**: Expo SecureStore (for tokens)
- **Camera**: Expo Image Picker / Expo Camera
- **Notifications**: Expo Notifications

### **Backend Integration**

- **Authentication**: Token-based (JWT or access token)
- **API**: Reuse existing Express.js endpoints
- **Real-Time**: Server-Sent Events or polling
- **File Upload**: Existing S3 upload endpoint

## 📚 Learning Path

### **Week 1-2: Foundation**

- React Native basics
- Expo setup and workflow
- Core components (View, Text, ScrollView)
- Styling with StyleSheet
- Navigation basics

### **Week 3-4: Intermediate**

- React Navigation advanced
- API integration
- State management
- Forms and user input
- List rendering

### **Week 5-6: Advanced**

- Native APIs (camera, storage)
- File uploads
- Real-time updates
- Complex state management
- Performance optimization

### **Week 7-8: Polish**

- Animations
- UI/UX improvements
- Testing
- Deployment

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS/Android)
- Or iOS Simulator (Mac) / Android Emulator

### **Initial Setup**

```bash
# Create new Expo project
npx create-expo-app@latest SplitMateMobile --template

# Navigate to project
cd SplitMateMobile

# Install dependencies
npm install

# Start development server
npm start
```

### **Development Workflow**

1. **Development**: Use Expo Go app for instant testing
2. **Testing**: Test on both iOS and Android regularly
3. **Building**: Use EAS Build for production builds
4. **Deployment**: Deploy to TestFlight (iOS) and Play Store (Android)

## 📱 Feature Comparison: Web vs Mobile

| Feature               | Web App | Mobile App | Status  |
| --------------------- | ------- | ---------- | ------- |
| Authentication        | ✅      | ✅         | Phase 2 |
| Groups List           | ✅      | ✅         | Phase 3 |
| Group Details         | ✅      | ✅         | Phase 3 |
| Receipt Upload        | ✅      | ✅         | Phase 4 |
| Expense Management    | ✅      | ✅         | Phase 5 |
| Real-Time Updates     | ✅      | ✅         | Phase 6 |
| Splitwise Integration | ✅      | ✅         | Phase 5 |
| Admin Dashboard       | ✅      | ❌         | Future  |
| Bug Reporting         | ✅      | ✅         | Phase 7 |

## 🎯 Success Metrics

- **Functionality**: All core features working on both platforms
- **Performance**: App loads in < 2 seconds
- **User Experience**: Smooth animations, intuitive navigation
- **Stability**: < 1% crash rate
- **Adoption**: Beta testers can complete full expense flow

## 📝 Notes & Considerations

### **Backend Changes Required**

1. **Authentication**: Add token-based auth (currently cookie-based)
2. **CORS**: Update to allow mobile app origins
3. **API**: Ensure all endpoints work with token auth
4. **Real-Time**: Consider WebSocket or SSE for job updates

### **Platform-Specific Considerations**

- **iOS**: App Store review process, design guidelines
- **Android**: Multiple screen sizes, different Android versions
- **Permissions**: Camera, storage permissions handled by Expo

### **Future Enhancements**

- Offline support with local caching
- Biometric authentication
- Widget support (iOS/Android)
- Apple Watch / Wear OS support
- Dark mode
- Internationalization

## 🔗 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Query](https://tanstack.com/query/latest)

## 📅 Timeline Summary

| Phase                   | Duration        | Key Deliverables       |
| ----------------------- | --------------- | ---------------------- |
| Phase 1: Foundation     | 2 weeks         | Basic app structure    |
| Phase 2: Auth & API     | 1-2 weeks       | Authentication working |
| Phase 3: Groups         | 1 week          | Groups navigation      |
| Phase 4: Receipt Upload | 1-2 weeks       | Camera & upload        |
| Phase 5: Expenses       | 1-2 weeks       | Expense management     |
| Phase 6: Real-Time      | 1 week          | Job status updates     |
| Phase 7: Polish         | 1-2 weeks       | UI/UX improvements     |
| Phase 8: Deploy         | 2 weeks         | App store submission   |
| **Total**               | **10-12 weeks** | **MVP Complete**       |

## ✅ Next Steps

1. **Read this plan thoroughly**
2. **Set up development environment**
3. **Start Phase 1: Foundation**
4. **Follow learning resources**
5. **Build iteratively, one feature at a time**

---

**Ready to start? Begin with Phase 1 and follow the learning path!** 🚀
