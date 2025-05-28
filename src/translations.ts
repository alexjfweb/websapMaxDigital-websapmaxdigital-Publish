
import type { Language } from '@/contexts/language-context';

export type Translations = {
  [key: string]: string;
};

export const translations: Record<Language, Translations> = {
  en: {
    // HomePage
    "home.welcome": "Welcome to websapMax!",
    "home.subline": "Your ultimate digital menu solution. Explore delicious dishes, place orders seamlessly, and share with ease.",
    "home.exploreButton": "Explore Our Menu",
    "home.interactiveMenuTitle": "Interactive Menu",
    "home.interactiveMenuDescription": "Browse our extensive menu with beautiful images and detailed descriptions.",
    "home.easyOrderingTitle": "Easy Ordering",
    "home.easyOrderingDescription": "Add your favorite dishes to the cart and send your order directly via WhatsApp.",
    "home.shareConnectTitle": "Share & Connect",
    "home.shareConnectDescription": "Easily share our menu with friends and family or make reservations.",
    "home.footerCopyright": "websapMax. All rights reserved.",
    "home.footerExperience": "Experience the future of dining.",

    // NavigationMenu
    "nav.publicMenu": "Public Menu",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.superAdminDashboard": "SA Dashboard",
    "nav.userManagement": "User Management",
    "nav.backup": "System Backup",
    "nav.logs": "System Logs",
    "nav.adminDashboard": "Admin Dashboard",
    "nav.restaurantProfile": "Restaurant Profile",
    "nav.dishManagement": "Dish Management",
    "nav.employeeManagement": "Employee Management",
    "nav.reservations": "Reservations",
    "nav.paymentMethods": "Payment Methods",
    "nav.shareMenu": "Share Menu",
    "nav.employeeDashboard": "Employee Dashboard",
    "nav.manageOrders": "Manage Orders",
    "nav.manageReservations": "Manage Reservations",
    "nav.promoteMenu": "Promote Menu",

    // AppHeader
    "header.selectLanguage": "Select Language",
    "header.notifications": "Toggle notifications",
    "header.myAccount": "My Account",
    "header.profile": "Profile",
    "header.settings": "Settings",
    "header.logout": "Log out",
    "header.loginButton": "Login",

    // AppLayout
    "appLayout.loading": "Loading application...",
    "appLayout.rolePrefix": "Role",
    "appLayout.guestAccess": "Guest Access",
  },
  es: {
    // HomePage
    "home.welcome": "¡Bienvenido a websapMax!",
    "home.subline": "Tu solución definitiva de menú digital. Explora platos deliciosos, realiza pedidos sin problemas y comparte con facilidad.",
    "home.exploreButton": "Explora Nuestro Menú",
    "home.interactiveMenuTitle": "Menú Interactivo",
    "home.interactiveMenuDescription": "Navega por nuestro extenso menú con hermosas imágenes y descripciones detalladas.",
    "home.easyOrderingTitle": "Pedidos Fáciles",
    "home.easyOrderingDescription": "Añade tus platos favoritos al carrito y envía tu pedido directamente por WhatsApp.",
    "home.shareConnectTitle": "Comparte y Conecta",
    "home.shareConnectDescription": "Comparte fácilmente nuestro menú con amigos y familiares o haz reservaciones.",
    "home.footerCopyright": "websapMax. Todos los derechos reservados.",
    "home.footerExperience": "Experimenta el futuro de la gastronomía.",

    // NavigationMenu
    "nav.publicMenu": "Menú Público",
    "nav.login": "Iniciar Sesión",
    "nav.register": "Registrarse",
    "nav.superAdminDashboard": "Panel SA",
    "nav.userManagement": "Gestión Usuarios",
    "nav.backup": "Copia Seguridad",
    "nav.logs": "Registros Sistema",
    "nav.adminDashboard": "Panel Admin",
    "nav.restaurantProfile": "Perfil Restaurante",
    "nav.dishManagement": "Gestión Platos",
    "nav.employeeManagement": "Gestión Empleados",
    "nav.reservations": "Reservas",
    "nav.paymentMethods": "Métodos Pago",
    "nav.shareMenu": "Compartir Menú",
    "nav.employeeDashboard": "Panel Empleado",
    "nav.manageOrders": "Gestionar Pedidos",
    "nav.manageReservations": "Gestionar Reservas",
    "nav.promoteMenu": "Promocionar Menú",

    // AppHeader
    "header.selectLanguage": "Seleccionar Idioma",
    "header.notifications": "Alternar notificaciones",
    "header.myAccount": "Mi Cuenta",
    "header.profile": "Perfil",
    "header.settings": "Configuración",
    "header.logout": "Cerrar Sesión",
    "header.loginButton": "Iniciar Sesión",

    // AppLayout
    "appLayout.loading": "Cargando aplicación...",
    "appLayout.rolePrefix": "Rol",
    "appLayout.guestAccess": "Acceso de Invitado",
  },
  pt: {
    // HomePage
    "home.welcome": "Bem-vindo ao websapMax!",
    "home.subline": "Sua solução definitiva de menu digital. Explore pratos deliciosos, faça pedidos de forma transparente e compartilhe com facilidade.",
    "home.exploreButton": "Explore Nosso Cardápio",
    "home.interactiveMenuTitle": "Cardápio Interativo",
    "home.interactiveMenuDescription": "Navegue pelo nosso extenso cardápio com belas imagens e descrições detalhadas.",
    "home.easyOrderingTitle": "Pedidos Fáceis",
    "home.easyOrderingDescription": "Adicione seus pratos favoritos ao carrinho e envie seu pedido diretamente pelo WhatsApp.",
    "home.shareConnectTitle": "Compartilhe e Conecte",
    "home.shareConnectDescription": "Compartilhe facilmente nosso cardápio com amigos e familiares ou faça reservas.",
    "home.footerCopyright": "websapMax. Todos os direitos reservados.",
    "home.footerExperience": "Experimente o futuro da gastronomia.",

    // NavigationMenu
    "nav.publicMenu": "Cardápio Público",
    "nav.login": "Entrar",
    "nav.register": "Registrar",
    "nav.superAdminDashboard": "Painel SA",
    "nav.userManagement": "Gerenc. Usuários",
    "nav.backup": "Backup Sistema",
    "nav.logs": "Logs Sistema",
    "nav.adminDashboard": "Painel Admin",
    "nav.restaurantProfile": "Perfil Restaurante",
    "nav.dishManagement": "Gerenc. Pratos",
    "nav.employeeManagement": "Gerenc. Funcionários",
    "nav.reservations": "Reservas",
    "nav.paymentMethods": "Métodos Pagamento",
    "nav.shareMenu": "Compartilhar Cardápio",
    "nav.employeeDashboard": "Painel Funcionário",
    "nav.manageOrders": "Gerenciar Pedidos",
    "nav.manageReservations": "Gerenciar Reservas",
    "nav.promoteMenu": "Promover Cardápio",

    // AppHeader
    "header.selectLanguage": "Selecionar Idioma",
    "header.notifications": "Alternar notificações",
    "header.myAccount": "Minha Conta",
    "header.profile": "Perfil",
    "header.settings": "Configurações",
    "header.logout": "Sair",
    "header.loginButton": "Entrar",

    // AppLayout
    "appLayout.loading": "Carregando aplicação...",
    "appLayout.rolePrefix": "Função",
    "appLayout.guestAccess": "Acesso de Convidado",
  },
  fr: {
    // HomePage
    "home.welcome": "Bienvenue chez websapMax!",
    "home.subline": "Votre solution de menu numérique ultime. Explorez des plats délicieux, passez des commandes en toute simplicité et partagez facilement.",
    "home.exploreButton": "Découvrez Notre Menu",
    "home.interactiveMenuTitle": "Menu Interactif",
    "home.interactiveMenuDescription": "Parcourez notre menu complet avec de belles images et des descriptions détaillées.",
    "home.easyOrderingTitle": "Commande Facile",
    "home.easyOrderingDescription": "Ajoutez vos plats préférés au panier et envoyez votre commande directement via WhatsApp.",
    "home.shareConnectTitle": "Partagez et Connectez",
    "home.shareConnectDescription": "Partagez facilement notre menu avec vos amis et votre famille ou faites des réservations.",
    "home.footerCopyright": "websapMax. Tous droits réservés.",
    "home.footerExperience": "Découvrez l'avenir de la restauration.",

    // NavigationMenu
    "nav.publicMenu": "Menu Public",
    "nav.login": "Connexion",
    "nav.register": "S'inscrire",
    "nav.superAdminDashboard": "Tableau SA",
    "nav.userManagement": "Gestion Utilisateurs",
    "nav.backup": "Sauvegarde Système",
    "nav.logs": "Journaux Système",
    "nav.adminDashboard": "Tableau Admin",
    "nav.restaurantProfile": "Profil Restaurant",
    "nav.dishManagement": "Gestion Plats",
    "nav.employeeManagement": "Gestion Employés",
    "nav.reservations": "Réservations",
    "nav.paymentMethods": "Moyens Paiement",
    "nav.shareMenu": "Partager Menu",
    "nav.employeeDashboard": "Tableau Employé",
    "nav.manageOrders": "Gérer Commandes",
    "nav.manageReservations": "Gérer Réservations",
    "nav.promoteMenu": "Promouvoir Menu",

    // AppHeader
    "header.selectLanguage": "Choisir la langue",
    "header.notifications": "Basculer les notifications",
    "header.myAccount": "Mon Compte",
    "header.profile": "Profil",
    "header.settings": "Paramètres",
    "header.logout": "Déconnexion",
    "header.loginButton": "Connexion",

    // AppLayout
    "appLayout.loading": "Chargement de l'application...",
    "appLayout.rolePrefix": "Rôle",
    "appLayout.guestAccess": "Accès Invité",
  },
};
