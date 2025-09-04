const routes = {
  // 🔓 PUBLIC ROUTES
  PUBLIC: {
    BLOGS: '/blogs',
    FAQ: '/faq',
    LANDING_DATA: '/landing/data',
    CONTACT_FORM: '/contact',
  },

  // 🔐 AUTH ROUTES
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // 📁 PROJECT ROUTES
  PROJECT: {
    ALL: '/projects',
    CREATE: '/projects/create',
    SINGLE: (id) => `/projects/${id}`,
    UPDATE: (id) => `/projects/${id}/update`,
    DELETE: (id) => `/projects/${id}/delete`,
    TASKS: (projectId) => `/projects/${projectId}/tasks`,
    TASK_DETAIL: (projectId, taskId) => `/projects/${projectId}/tasks/${taskId}`,
  },

  // 👑 ADMIN ROUTES
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USER_DETAIL: (id) => `/admin/users/${id}`,
    STATS: '/admin/stats',
    AUDIT_LOGS: '/admin/logs',
    SETTINGS: '/admin/settings',
  },

  // 📤 UPLOAD ROUTES
  UPLOAD: {
    FILE: '/files/upload',
    PROFILE_PIC: '/files/profile-picture',
    DOCUMENT: '/files/document',
  },
}

export default routes
