

export const translations = {
  en: {
    // Navigation
    features: 'Features',
    resources: 'Resources',
    pricing: 'Pricing',
    login: 'Log In',
    signup: 'Sign Up',
    dashboard: 'Dashboard',
    adminPanel: 'Admin Panel',
    signOut: 'Sign Out',
    
    // Hero Section
    heroTitle: 'Automated Cryptocurrency Trading with KongTrade',
    heroSubtitle: 'Professional trading bot with King Kong power. Integration with Binance and Bybit exchanges.',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    
    // Features
    automation: 'Automation',
    automationDesc: 'Fully automated trading with advanced algorithms',
    security: 'Security',
    securityDesc: 'Bank-level security for your cryptocurrency assets',
    support: 'Support',
    supportDesc: '24/7 professional support for all users',
    
    // Pricing
    chooseYourPlan: 'Choose Your Trading Plan',
    monthly: 'Monthly',
    yearly: 'Yearly',
    mostPopular: 'Most Popular',
    selectPlan: 'Select Plan',
    
    // Payment
    chooseAmount: 'Choose amount for payment',
    selectPaymentMethod: 'Select payment method',
    binanceWallet: 'Binance Wallet',
    bybitWallet: 'Bybit Wallet',
    proceedPayment: 'Proceed to Payment',
    
    // Footer
    aboutUs: 'About Us',
    contact: 'Contact',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    allRightsReserved: 'All rights reserved',
    
    // Money back guarantee
    moneyBackGuarantee: 'Money back guarantee (only if bot hasn\'t been launched yet)',
  }
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en

