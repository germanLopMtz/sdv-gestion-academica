import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import alumnoReducer from './slices/alumnoSlice';


const persistedUser = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

export const store = configureStore({
  reducer: {
    user: userReducer,
    alumno: alumnoReducer,

  },
  preloadedState: {
    user: {
      user: persistedUser,
      status: 'idle',
      error: null,
    }
  }
});