// Internationalization (i18n) Service
// Multi-language support for the application

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

export interface TranslationNamespace {
  common: Record<string, string>;
  navigation: Record<string, string>;
  dashboard: Record<string, string>;
  auth: Record<string, string>;
  errors: Record<string, string>;
  forms: Record<string, string>;
  notifications: Record<string, string>;
}

const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', flag: '🇧🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', flag: '🇮🇳' }
];

// Base English translations
const EN_TRANSLATIONS: TranslationNamespace = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    loading: 'Loading...',
    noData: 'No data available',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    reset: 'Reset',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    all: 'All',
    none: 'None',
    select: 'Select',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    name: 'Name',
    description: 'Description',
    type: 'Type',
    category: 'Category',
    priority: 'Priority',
    settings: 'Settings',
    help: 'Help',
    logout: 'Logout'
  },
  navigation: {
    home: 'Home',
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    documents: 'Documents',
    reports: 'Reports',
    settings: 'Settings',
    profile: 'Profile',
    notifications: 'Notifications',
    search: 'Search',
    help: 'Help & Support'
  },
  dashboard: {
    welcome: 'Welcome back',
    overview: 'Overview',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    statistics: 'Statistics',
    pendingTasks: 'Pending Tasks',
    completedTasks: 'Completed Tasks',
    upcomingEvents: 'Upcoming Events',
    systemHealth: 'System Health'
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    forgotPassword: 'Forgot Password',
    resetPassword: 'Reset Password',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    rememberMe: 'Remember Me',
    twoFactorAuth: 'Two-Factor Authentication',
    verifyCode: 'Verify Code'
  },
  errors: {
    generic: 'An error occurred',
    notFound: 'Not found',
    unauthorized: 'Unauthorized',
    forbidden: 'Access denied',
    serverError: 'Server error',
    networkError: 'Network error',
    validationError: 'Validation error',
    timeout: 'Request timeout'
  },
  forms: {
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',
    minLength: 'Minimum {min} characters required',
    maxLength: 'Maximum {max} characters allowed',
    passwordMismatch: 'Passwords do not match',
    invalidDate: 'Invalid date',
    invalidNumber: 'Invalid number'
  },
  notifications: {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    taskAssigned: 'New task assigned',
    taskCompleted: 'Task completed',
    documentShared: 'Document shared with you',
    systemUpdate: 'System update available'
  }
};

// Spanish translations
const ES_TRANSLATIONS: TranslationNamespace = {
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    search: 'Buscar',
    filter: 'Filtrar',
    export: 'Exportar',
    import: 'Importar',
    refresh: 'Actualizar',
    loading: 'Cargando...',
    noData: 'No hay datos disponibles',
    confirm: 'Confirmar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    submit: 'Enviar',
    reset: 'Restablecer',
    close: 'Cerrar',
    yes: 'Sí',
    no: 'No',
    all: 'Todos',
    none: 'Ninguno',
    select: 'Seleccionar',
    actions: 'Acciones',
    status: 'Estado',
    date: 'Fecha',
    time: 'Hora',
    name: 'Nombre',
    description: 'Descripción',
    type: 'Tipo',
    category: 'Categoría',
    priority: 'Prioridad',
    settings: 'Configuración',
    help: 'Ayuda',
    logout: 'Cerrar sesión'
  },
  navigation: {
    home: 'Inicio',
    dashboard: 'Panel',
    tasks: 'Tareas',
    documents: 'Documentos',
    reports: 'Informes',
    settings: 'Configuración',
    profile: 'Perfil',
    notifications: 'Notificaciones',
    search: 'Buscar',
    help: 'Ayuda y Soporte'
  },
  dashboard: {
    welcome: 'Bienvenido de nuevo',
    overview: 'Resumen',
    recentActivity: 'Actividad Reciente',
    quickActions: 'Acciones Rápidas',
    statistics: 'Estadísticas',
    pendingTasks: 'Tareas Pendientes',
    completedTasks: 'Tareas Completadas',
    upcomingEvents: 'Próximos Eventos',
    systemHealth: 'Estado del Sistema'
  },
  auth: {
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',
    register: 'Registrarse',
    forgotPassword: 'Olvidé mi contraseña',
    resetPassword: 'Restablecer contraseña',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    rememberMe: 'Recordarme',
    twoFactorAuth: 'Autenticación de dos factores',
    verifyCode: 'Verificar código'
  },
  errors: {
    generic: 'Ocurrió un error',
    notFound: 'No encontrado',
    unauthorized: 'No autorizado',
    forbidden: 'Acceso denegado',
    serverError: 'Error del servidor',
    networkError: 'Error de red',
    validationError: 'Error de validación',
    timeout: 'Tiempo de espera agotado'
  },
  forms: {
    required: 'Este campo es obligatorio',
    invalidEmail: 'Dirección de correo inválida',
    invalidPhone: 'Número de teléfono inválido',
    minLength: 'Mínimo {min} caracteres requeridos',
    maxLength: 'Máximo {max} caracteres permitidos',
    passwordMismatch: 'Las contraseñas no coinciden',
    invalidDate: 'Fecha inválida',
    invalidNumber: 'Número inválido'
  },
  notifications: {
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información',
    taskAssigned: 'Nueva tarea asignada',
    taskCompleted: 'Tarea completada',
    documentShared: 'Documento compartido contigo',
    systemUpdate: 'Actualización del sistema disponible'
  }
};

// Store all translations
const TRANSLATIONS: Record<SupportedLanguage, TranslationNamespace> = {
  en: EN_TRANSLATIONS,
  es: ES_TRANSLATIONS,
  fr: EN_TRANSLATIONS, // Placeholder - would have French translations
  de: EN_TRANSLATIONS, // Placeholder - would have German translations
  pt: EN_TRANSLATIONS, // Placeholder - would have Portuguese translations
  zh: EN_TRANSLATIONS, // Placeholder - would have Chinese translations
  ja: EN_TRANSLATIONS, // Placeholder - would have Japanese translations
  ko: EN_TRANSLATIONS, // Placeholder - would have Korean translations
  ar: EN_TRANSLATIONS, // Placeholder - would have Arabic translations
  hi: EN_TRANSLATIONS  // Placeholder - would have Hindi translations
};

class I18nService {
  private readonly LANGUAGE_KEY = 'app_language';
  private currentLanguage: SupportedLanguage = 'en';
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadSavedLanguage();
  }

  private loadSavedLanguage(): void {
    const saved = localStorage.getItem(this.LANGUAGE_KEY);
    if (saved && this.isValidLanguage(saved)) {
      this.currentLanguage = saved as SupportedLanguage;
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (this.isValidLanguage(browserLang)) {
        this.currentLanguage = browserLang as SupportedLanguage;
      }
    }
  }

  private isValidLanguage(code: string): boolean {
    return SUPPORTED_LANGUAGES.some(l => l.code === code);
  }

  // Get current language
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  // Get current language info
  getCurrentLanguageInfo(): LanguageInfo {
    return SUPPORTED_LANGUAGES.find(l => l.code === this.currentLanguage) || SUPPORTED_LANGUAGES[0];
  }

  // Get all supported languages
  getSupportedLanguages(): LanguageInfo[] {
    return SUPPORTED_LANGUAGES;
  }

  // Set language
  setLanguage(code: SupportedLanguage): void {
    if (!this.isValidLanguage(code)) return;
    
    this.currentLanguage = code;
    localStorage.setItem(this.LANGUAGE_KEY, code);
    
    // Update document direction for RTL languages
    const langInfo = this.getCurrentLanguageInfo();
    document.documentElement.dir = langInfo.direction;
    document.documentElement.lang = code;
    
    // Notify listeners
    this.notifyListeners();
  }

  // Translate a key
  t(namespace: keyof TranslationNamespace, key: string, params?: Record<string, string | number>): string {
    const translations = TRANSLATIONS[this.currentLanguage];
    const ns = translations[namespace];
    let text = ns[key] || TRANSLATIONS.en[namespace][key] || key;
    
    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, String(value));
      });
    }
    
    return text;
  }

  // Subscribe to language changes
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  // Get translation coverage for a language
  getTranslationCoverage(code: SupportedLanguage): number {
    const langTranslations = TRANSLATIONS[code];
    const enTranslations = TRANSLATIONS.en;
    
    let total = 0;
    let translated = 0;
    
    Object.keys(enTranslations).forEach(namespace => {
      const ns = namespace as keyof TranslationNamespace;
      const enKeys = Object.keys(enTranslations[ns]);
      total += enKeys.length;
      
      enKeys.forEach(key => {
        if (langTranslations[ns][key] && langTranslations[ns][key] !== enTranslations[ns][key]) {
          translated++;
        }
      });
    });
    
    // English is always 100%
    if (code === 'en') return 100;
    
    return Math.round((translated / total) * 100);
  }

  // Export translations for a language
  exportTranslations(code: SupportedLanguage): string {
    return JSON.stringify(TRANSLATIONS[code], null, 2);
  }

  // Format date according to locale
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
  }

  // Format number according to locale
  formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLanguage, options).format(num);
  }

  // Format currency according to locale
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency
    }).format(amount);
  }
}

export const i18nService = new I18nService();

// React hook for using translations
export function useTranslation() {
  const [, setUpdate] = useState(0);
  
  useEffect(() => {
    const unsubscribe = i18nService.subscribe(() => {
      setUpdate(u => u + 1);
    });
    return unsubscribe;
  }, []);
  
  return {
    t: (namespace: keyof TranslationNamespace, key: string, params?: Record<string, string | number>) => 
      i18nService.t(namespace, key, params),
    currentLanguage: i18nService.getCurrentLanguage(),
    setLanguage: (code: SupportedLanguage) => i18nService.setLanguage(code),
    languages: i18nService.getSupportedLanguages(),
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => 
      i18nService.formatDate(date, options),
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) => 
      i18nService.formatNumber(num, options),
    formatCurrency: (amount: number, currency?: string) => 
      i18nService.formatCurrency(amount, currency)
  };
}
