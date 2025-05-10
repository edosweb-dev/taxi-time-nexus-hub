
// This file re-exports all user API functions for backward compatibility
export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from './api/users';
export type { UserFormData } from './api/users';
