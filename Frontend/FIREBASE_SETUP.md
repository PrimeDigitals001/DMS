# Firebase Setup Guide

## Required Packages to Install

Run these commands in your Frontend directory:

```bash
npm install firebase @angular/fire
```

## What Has Been Configured

### 1. Environment Files
- `src/environments/environment.ts` - Development Firebase config
- `src/environments/environment.prod.ts` - Production Firebase config

### 2. Firebase Configuration
- `src/firebase.config.ts` - Firebase initialization
- `src/app/core/services/firebase.service.ts` - Firebase service wrapper

### 3. Updated Services
- `src/app/core/services/client.service.ts` - Now uses Firestore
- `src/app/core/services/item.service.ts` - Now uses Firestore + Storage

### 4. Main App
- `src/main.ts` - Firebase initialization on app startup

## Firebase Collections

Your Firebase project will use these collections:
- `clients` - For client management
- `items` - For item management

## Features Available

✅ **Firestore Database** - NoSQL document database
✅ **Authentication** - User login/signup (ready to implement)
✅ **Storage** - File/image uploads
✅ **Real-time Updates** - Live data synchronization
✅ **Offline Support** - Works without internet

## Next Steps

1. Install the required packages
2. Run your project: `npm start`
3. Check browser console for "Firebase initialized successfully"
4. Your app will now use Firebase instead of HTTP calls

## Security Rules

Make sure to set up proper Firestore security rules in your Firebase console to protect your data.
