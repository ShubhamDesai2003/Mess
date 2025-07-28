import classes from "./index.module.css";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import {
    MenuOutlined,
    CloseOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    QrcodeOutlined,
    CalendarOutlined,
    TableOutlined,
    SettingOutlined,
    SolutionOutlined,
    ScanOutlined,
    HomeOutlined,
    InfoCircleOutlined,
    AppstoreOutlined,
    ContactsOutlined,
    DownOutlined
} from '@ant-design/icons';
import { Menu, message } from 'antd';
import api from "../..";

// Function to handle section navigation
const handleSectionNavigation = (sectionId, navigate, setOpen) => {
    // If already on homepage, just scroll to the section
    if (window.location.pathname === '/') {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        // If not on homepage, navigate to homepage with section hash
        navigate(`/#${sectionId}`);
    }
    
    // Close mobile menu if it's open
    setOpen(false);
};

const getItem = (label, link, icon, key, navigate, setOpen) => {
    // Special handling for section links
    if (link.startsWith('/#')) {
        const sectionId = link.substring(2); // Remove '/#' to get the section ID
        return {
            key,
            icon,
            label: <a onClick={() => handleSectionNavigation(sectionId, navigate, setOpen)}>{label}</a>,
        };
    }
    // Regular navigation links
    return {
        key,
        icon,
        label: <Link to={link}>{label}</Link>,
    };
};

const getLoginItem = (label, link, icon, key, handleSignInOut) => ({
    key,
    icon,
    label: <a href={link} onClick={handleSignInOut}>{label}</a>,
});

export default function MenuBar() {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [showFeatures, setShowFeatures] = useState(false);
    const [transparent, setTransparent] = useState(true);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [expandedMenu, setExpandedMenu] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const navigate = useNavigate();
    const location = useLocation();
    
    // Add scroll listener for transparent menu effect
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            if (scrollPosition > 50) {
                setTransparent(false);
            } else {
                setTransparent(true);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('api/data/status');
                setStatus(response.data);
            } catch (error) {
                message.error('Failed to fetch data from server');
            }
        };
        fetchData();
    }, []);

    // Reset hovered card when features menu is closed
    useEffect(() => {
        if (!showFeatures) {
            setHoveredCard(null);
        }
    }, [showFeatures]);

    const handleSignInOut = async (e) => {
        e.preventDefault();
        
        if (status?.loggedIn) {
            try {
                await api.get('api/auth/signout');
                const response = await api.get('api/data/status');
                setStatus(response.data);
                navigate('/');
            } catch (error) {
                message.error('Failed to sign out');
            }
        } else {
            try {
                window.location.href = window.APIROOT + 'api/auth/signin';
            } catch (error) {
                message.error('Failed to sign in');
            }
        }
    };

    const mainNavItems = status?.loggedIn 
      ? [ // Only show these when logged IN
          getItem('Menu', '/schedule', <TableOutlined />, 'menu', navigate, setOpen),
        ]
      : [ // Show full menu when logged OUT
          getItem('Home', '/#home', <HomeOutlined />, 'home', navigate, setOpen),
          getItem('About Us', '/#about', <InfoCircleOutlined />, 'about', navigate, setOpen),
          getItem('Features', '/#features', <AppstoreOutlined />, 'features', navigate, setOpen),
          getItem('Menu', '/schedule', <TableOutlined />, 'menu', navigate, setOpen),
          getItem('Contact', '/#contact', <ContactsOutlined />, 'contact', navigate, setOpen),
        ];

    // Create login item separately so we can position it first
    const loginItem = window.location.pathname === '/' 
    ? [] 
    : [
        getLoginItem(
            status?.loggedIn ? 'Sign out' : 'Sign in', 
            status?.loggedIn ? window.APIROOT + 'api/auth/signout' : window.APIROOT + 'api/auth/signin', 
            <UserOutlined />, 
            '2',
            handleSignInOut
        )
    ];
    
    // Items for vertical menu - used when logged in
    const verticalMenuItems = [
        { icon: <HomeOutlined />, label: 'Home', link: '/', key: 'v-home' },
        { icon: <TableOutlined />, label: 'Schedule', link: '/schedule', key: 'v-schedule' },
        { icon: <ShoppingCartOutlined />, label: 'Buy Coupons', link: '/buy-coupons', key: 'v-coupons' },
        { icon: <CalendarOutlined />, label: 'Purchase History', link: '/purchase-history', key: 'v-history' },
        { icon: <QrcodeOutlined />, label: 'QR Code', link: '/qr-code', key: 'v-qrcode' },
    ];
    
    // Admin menu items - only shown if user is admin
    const adminMenuItems = status?.admin ? [
        { icon: <SettingOutlined />, label: 'Admin Panel', link: '/admin', key: 'v-admin' },
        { icon: <SolutionOutlined />, label: 'Total Meals', link: '/total-meals', key: 'v-meals' },
        { icon: <SolutionOutlined />, label: 'Forecasting', link: 'forecast/', key: 'v-ai' },
        { icon: <ScanOutlined />, label: 'Scan QR', link: '/scan-qr', key: 'v-scan' },
    ] : [];
    
    // Rest of the side menu items
    const otherSideMenuItems = [
        ...(status?.loggedIn ? [
            { type: 'divider' },
            getItem('Schedule', '/schedule', <TableOutlined />, '3', navigate, setOpen),
            getItem('Buy coupons', '/buy-coupons', <ShoppingCartOutlined />, '4', navigate, setOpen),
            getItem('Purchase history', '/purchase-history', <CalendarOutlined />, '5', navigate, setOpen),
            getItem('QR code', '/qr-code', <QrcodeOutlined />, '6', navigate, setOpen),
            ...(status?.admin ? [
                { type: 'divider' },
                getItem('Admin panel', '/admin', <SettingOutlined />, '7', navigate, setOpen),
                getItem('Total meals', '/total-meals', <SolutionOutlined />, '8', navigate, setOpen),
                getItem('Scan QR code', '/scan-qr', <ScanOutlined />, '9', navigate, setOpen),
            ] : []),
        ] : [])
    ];

    // Mobile menu items - ensure they include all navigation links
    const mobileMenuItems = [
        getLoginItem(
            status?.loggedIn ? 'Sign out' : 'Sign in', 
            status?.loggedIn ? window.APIROOT + 'api/auth/signout' : window.APIROOT + 'api/auth/signin', 
            <UserOutlined />, 
            'mobile-signin',
            handleSignInOut
        ),
        { type: 'divider' },
        ...(status?.loggedIn 
          ? [] // Hide all except essential items when logged in
          : [
              getItem('Home', '/#home', <HomeOutlined />, 'mobile-home', navigate, setOpen),
              getItem('About Us', '/#about', <InfoCircleOutlined />, 'mobile-about', navigate, setOpen),
              getItem('Features', '/#features', <AppstoreOutlined />, 'mobile-features', navigate, setOpen),
              getItem('Menu', '/schedule', <TableOutlined />, 'mobile-menu', navigate, setOpen),
              getItem('Contact', '/#contact', <ContactsOutlined />, 'mobile-contact', navigate, setOpen),
            ]
        ),
        ...otherSideMenuItems
    ];
    
    const items = isMobile 
    ? mobileMenuItems 
    : [...loginItem, ...otherSideMenuItems];
    
    // Feature mega menu items - updated to remove Dietary Preferences and Campus Delivery
    const featureItems = [
        {
            title: "Weekly Menu",
            icon: "fas fa-utensils",
            frontDescription: "Explore our diverse weekly menu",
            backDescription: "Browse through a variety of nutritious meal options updated every week to ensure freshness and variety",
            color: "#FF7043"
        },
        {
            title: "Digital Coupons",
            icon: "fas fa-ticket-alt",
            frontDescription: "Purchase meal coupons online",
            backDescription: "Securely buy and manage your meal coupons through our integrated Razorpay payment system",
            color: "#42A5F5"
        },
        {
            title: "QR Code System",
            icon: "fas fa-qrcode",
            frontDescription: "Quick and convenient redemption",
            backDescription: "Simply scan your unique QR code to redeem meals without waiting in long queues",
            color: "#66BB6A"
        },
        {
            title: "Meal Planning",
            icon: "fas fa-clipboard-list",
            frontDescription: "Plan your meals ahead of time",
            backDescription: "Schedule your meals for the week and get personalized nutrition information",
            color: "#AB47BC"
        }
    ];

    const showBurgerMenu = isMobile || status?.loggedIn || window.location.pathname !== '/';
    
    // Handle click on vertical menu item
    const handleVerticalMenuClick = (link) => {
        navigate(link);
        if (!isMobile) {
            setExpandedMenu(false); // Collapse menu after click
        }
    };

    return (
        <>
            {/* Vertical navigation for logged-in users on desktop */}
            {status?.loggedIn && !isMobile && (
                <motion.div
                    className={classes.verticalNavContainer}
                    initial={{ width: "70px" }}
                    animate={{ width: expandedMenu ? "220px" : "70px" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    onMouseEnter={() => setExpandedMenu(true)}
                    onMouseLeave={() => setExpandedMenu(false)}
                >
                    <div className={classes.verticalNavItems}>
                        {verticalMenuItems.map((item) => (
                            <motion.div
                                key={item.key}
                                className={classes.verticalNavItem}
                                whileHover={{ backgroundColor: "#f8f8f8" }}
                                onClick={() => handleVerticalMenuClick(item.link)}
                            >
                                <div className={classes.verticalNavIcon}>
                                    {item.icon}
                                </div>
                                {expandedMenu && (
                                    <motion.div
                                        className={classes.verticalNavLabel}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {item.label}
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                        
                        {adminMenuItems.length > 0 && (
                            <>
                                <div className={classes.verticalNavDivider} />
                                {adminMenuItems.map((item) => (
                                    <motion.div
                                        key={item.key}
                                        className={classes.verticalNavItem}
                                        whileHover={{ backgroundColor: "#f8f8f8" }}
                                        onClick={() => handleVerticalMenuClick(item.link)}
                                    >
                                        <div className={classes.verticalNavIcon}>
                                            {item.icon}
                                        </div>
                                        {expandedMenu && (
                                            <motion.div
                                                className={classes.verticalNavLabel}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {item.label}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </>
                        )}
                    </div>
                </motion.div>
            )}
            
            {/* Burger menu button - only show when appropriate */}
            {showBurgerMenu && (
                <motion.div
                    className={classes.navBtn}
                    onClick={() => setOpen(!open)}
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {open ? <CloseOutlined /> : <MenuOutlined />}
                </motion.div>
            )}
            
            <motion.div 
                className={`${classes.menuContainer} ${transparent ? classes.transparentMenu : ''}`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                
                <div className={classes.logoContainer}>
                    <Link 
                        to="/" 
                        onClick={(e) => {
                            if (status?.loggedIn) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <motion.img 
                            src="/assets/icon.png" 
                            alt="CampusBite Logo" 
                            className={classes.logoImg}
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            transition={{ duration: 0.2 }} 
                        />
                        <span className={classes.logoText}>
                            Campus<span className={classes.biteText}>Bite</span>
                        </span>
                    </Link>
                </div>

                
                {/* Only show navbar on non-mobile screens */}
                {!isMobile && !status?.loggedIn && (
                    <nav className={classes.navbar}>
                        <ul>
                            <motion.li whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                                <a onClick={() => handleSectionNavigation('home', navigate, setOpen)}>Home</a>
                            </motion.li>
                            <motion.li whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                                <a onClick={() => handleSectionNavigation('about', navigate, setOpen)}>About Us</a>
                            </motion.li>
                            <div 
                                className={classes.featuresContainer}
                                onMouseEnter={() => setShowFeatures(true)}
                                onMouseLeave={() => setShowFeatures(false)}
                            >
                                <motion.li 
                                    whileHover={{ y: -3 }} 
                                    transition={{ duration: 0.2 }}
                                    className={classes.featuresMenuItem}
                                >
                                    <a onClick={() => handleSectionNavigation('features', navigate, setOpen)} className={classes.featureMenuLink}>
                                        Features
                                        <DownOutlined className={classes.menuArrowIcon} />
                                    </a>
                                </motion.li>
                            </div>
                            <motion.li whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                                <Link to="/schedule">Menu</Link>
                            </motion.li>
                            <motion.li whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                                <a onClick={() => handleSectionNavigation('contact', navigate, setOpen)}>Contact</a>
                            </motion.li>
                        </ul>
                    </nav>
                )}
                
                {/* Sign in/out button - kept exactly as in old version */}
                <div className={classes.signInButton}>
                    <a 
                        href={status?.loggedIn ? window.APIROOT + 'api/auth/signout' : window.APIROOT + 'api/auth/signin'}
                        className={classes.signInLink}
                    >
                        {status?.loggedIn ? 'Sign out' : 'Sign in'}
                    </a>
                </div>
            </motion.div>
            
            {/* Full screen features mega menu */}
            {!isMobile && !status?.loggedIn && (
                <div 
                    className={classes.featuresContainer}
                    onMouseEnter={() => setShowFeatures(true)}
                    onMouseLeave={() => setShowFeatures(false)}
                >
                    <AnimatePresence>
                        {showFeatures && (
                            <motion.div 
                                className={classes.fullScreenFeatures}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className={classes.featuresMegaMenuContent}>
                                    <div className={classes.featuresMegaMenuHeader}>
                                        <h2>Discover Our <span className={classes.highlightText}>Features</span></h2>
                                        <p>Experience the convenience of modern campus dining</p>
                                    </div>
                                    
                                    <div className={classes.featureCardsGrid}>
                                        {featureItems.map((feature, index) => (
                                            <motion.div 
                                                className={classes.featureCardContainer}
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ 
                                                    opacity: 1, 
                                                    y: 0,
                                                    transition: { delay: index * 0.1 }
                                                }}
                                            >
                                                {/* Card container with perspective */}
                                                <div 
                                                    className={classes.featureCard}
                                                    onMouseEnter={() => setHoveredCard(index)}
                                                    onMouseLeave={() => setHoveredCard(null)}
                                                    style={{ perspective: "1000px" }}
                                                >
                                                    {/* Front of card */}
                                                    <motion.div 
                                                        className={classes.featureCardFront}
                                                        style={{ 
                                                            borderTop: `4px solid ${feature.color}`,
                                                            boxShadow: `0 10px 20px rgba(0, 0, 0, 0.05)`,
                                                            backfaceVisibility: "hidden",
                                                            position: "absolute",
                                                            width: "100%",
                                                            height: "100%",
                                                            transformStyle: "preserve-3d"
                                                        }}
                                                        animate={{
                                                            rotateY: hoveredCard === index ? 180 : 0
                                                        }}
                                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                                    >
                                                        <div className={classes.featureIconWrapper} style={{ backgroundColor: `${feature.color}20` }}>
                                                            <i className={`${feature.icon} ${classes.featureIcon}`} style={{ color: feature.color }}></i>
                                                        </div>
                                                        <h3>{feature.title}</h3>
                                                        <p>{feature.frontDescription}</p>
                                                    </motion.div>
                                                    
                                                    {/* Back of card */}
                                                    <motion.div 
                                                        className={classes.featureCardBack}
                                                        style={{ 
                                                            backgroundColor: feature.color,
                                                            backfaceVisibility: "hidden",
                                                            position: "absolute",
                                                            width: "100%",
                                                            height: "100%",
                                                            transformStyle: "preserve-3d",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            padding: "1rem",
                                                            color: "#fff",
                                                            textAlign: "center"
                                                        }}
                                                        initial={{ rotateY: 180 }}
                                                        animate={{
                                                            rotateY: hoveredCard === index ? 0 : 180
                                                        }}
                                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                                    >
                                                        <p style={{ marginBottom: "1rem" }}>{feature.backDescription}</p>
                                                        <a 
                                                            onClick={() => handleSectionNavigation('features', navigate, setOpen)}
                                                            className={classes.learnMoreLink}
                                                            // style={{
                                                            //     color: "#fff",
                                                            //     padding: "0.5rem 1rem",
                                                            //     borderRadius: "4px",
                                                            //     border: "2px solid #fff",
                                                            //     textDecoration: "none",
                                                            //     fontWeight: "bold",
                                                            //     transition: "all 0.3s ease",
                                                            //     cursor: "pointer"
                                                            // }}
                                                        >
                                                            {/* Learn More */}
                                                        </a>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
            
            {/* Side menu with controlled visibility based on "open" state only */}
            <motion.div
                className={classes.navWrap}
                animate={{ x: open ? 0 : isMobile ? "100%" : "15rem" }}
                initial={{ x: isMobile ? "100%" : "15rem" }}
                transition={{ duration: 0.3 }}
            >
                <Menu 
                    className={classes.nav} 
                    theme="light" 
                    defaultSelectedKeys={['1']} 
                    mode="inline" 
                    items={items} 
                    onClick={() => setOpen(false)}
                />
            </motion.div>
            
            {/* Gap for fixed header - adjust for logged in state */}
            <div className={`${classes.gap} ${status?.loggedIn && !isMobile ? classes.loggedInGap : ''}`} />
        </>
    );
}