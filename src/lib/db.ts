import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { app, useEmulators } from '@/lib/firebase'

// Firestore는 할 일 화면에서만 쓰므로 firebase.ts와 분리한다.
// 로그인 화면은 이 모듈을 import하지 않아 Firestore SDK(gzip 약 100KB)를 내려받지 않는다.
export const db = getFirestore(app)
if (useEmulators) connectFirestoreEmulator(db, '127.0.0.1', 8080)
