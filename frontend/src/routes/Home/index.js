import classes from './index.module.css';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function HomePage() {
    // Add this state and function to handle sign-in
    const [status, setStatus] = useState(false);

    // Handle sign-in the same way as in MenuBar
    const handleSignIn = (e) => {
        e.preventDefault();
        try {
            window.location.href = window.APIROOT + 'api/auth/signin';
        } catch (error) {
            console.error('Failed to redirect to sign in');
        }
    };

    return (
        <div className={classes.container}>
            {/* Hero Section */}
            <section className={classes.hero} id="home">
                <div className={classes.heroContent}>
                    <h1>
                        Fresh Food,<br />
                        <span className={classes.highlight}>Delivered</span> To<br />
                        Your Campus
                    </h1>
                    <p>Elevate your campus dining experience with delicious, affordable meals that fuel your academic journey.</p>
                    <div className={classes.buttons}>
                        <Link to="/schedule">
                            <Button type="primary" size="large" className={classes.primaryBtn}>
                                Explore Menu
                            </Button>
                        </Link>
                        {/* Update Join Now button to use the same sign-in handler */}
                        <Button 
                            size="large" 
                            className={classes.secondaryBtn}
                            onClick={handleSignIn}
                        >
                            Join Now
                        </Button>
                    </div>
                    <div className={classes.statRow}>
                        <div className={classes.stat}>
                            <span className={classes.statNumber}>4.8</span>
                            <span className={classes.statLabel}>Customer Rating</span>
                        </div>
                        <div className={classes.statDivider}></div>
                        <div className={classes.stat}>
                            <span className={classes.statNumber}>15+</span>
                            <span className={classes.statLabel}>Daily Specials</span>
                        </div>
                        <div className={classes.statDivider}></div>
                        <div className={classes.stat}>
                            <span className={classes.statNumber}>3K+</span>
                            <span className={classes.statLabel}>Happy Students</span>
                        </div>
                    </div>
                </div>
                <div className={classes.heroImageContainer}>
                    <div className={classes.heroImageWrapper}>
                        <img src="/assets/Dish.png" alt="Delicious Campus Food" className={classes.heroImage} />
                        <div className={classes.foodTag}>
                            <span className={classes.tagIcon}>🔥</span>
                            <span className={classes.tagText}>Most Popular</span>
                        </div>
                    </div>
                    <div className={classes.heroPattern}></div>
                </div>
            </section>

            {/* About Us Section */}
            <section className={classes.about} id="about">
                <div className={classes.aboutWrapper}>
                    <div className={classes.aboutImageSection}>
                        <div className={classes.aboutImageMain}>
                            <img src="https://images.pexels.com/photos/3217156/pexels-photo-3217156.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Our Team Cooking" />
                        </div>
                        <div className={classes.aboutImageAccent}>
                            <img src="https://media.istockphoto.com/id/1081422898/photo/pan-fried-duck.jpg?s=612x612&w=0&k=20&c=kzlrX7KJivvufQx9mLd-gMiMHR6lC2cgX009k9XO6VA=" alt="Food Preparation" />
                        </div>
                        <div className={classes.aboutPattern}></div>
                    </div>
                    <div className={classes.aboutContent}>
                        <h4 className={classes.aboutPreTitle}>Our Story</h4>
                        <h2 className={classes.aboutTitle}>Crafting Campus Cuisine Since <span className={classes.highlight}>2022</span></h2>
                        <p className={classes.aboutText}>
                            CampusBite began with a simple mission: to transform campus dining with delicious, 
                            affordable meals that fuel academic success. We understand the challenges of 
                            student life and craft our menu to provide nutritious options that keep you energized.
                        </p>
                        <p className={classes.aboutText}>
                            What sets us apart is our commitment to quality ingredients, diverse flavors, 
                            and a seamless dining experience designed specifically for campus life.
                        </p>
                        <div className={classes.aboutFeatures}>
                            <div className={classes.aboutFeature}>
                                <div className={classes.featureIcon}>
                                    <i className="fas fa-leaf"></i>
                                </div>
                                <div className={classes.featureText}>
                                    <h4>Fresh Ingredients</h4>
                                    <p>Locally sourced whenever possible</p>
                                </div>
                            </div>
                            <div className={classes.aboutFeature}>
                                <div className={classes.featureIcon}>
                                    <i className="fas fa-utensils"></i>
                                </div>
                                <div className={classes.featureText}>
                                    <h4>Diverse Menu</h4>
                                    <p>Options for all dietary preferences</p>
                                </div>
                            </div>
                        </div>
                        <Link to="/about">
                           
                        </Link>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className={classes.contact} id="contact">
                <h2 className={classes.sectionTitle}>Contact Us</h2>
                <p className={classes.contactText}>
                    Have questions? Reach out to us at <a href="mailto:support@campusbite.com">support@campusbite.com</a> or call us at (+91) 7620268492.
                </p>
                <div className={classes.contactInfo}>
                    <div className={classes.contactItem}>
                        <i className="fas fa-map-marker-alt"></i>
                        <p>Indira College Of Engineering And Management , Parandwadi, Pune</p>
                    </div>
                    <div className={classes.contactItem}>
                        <i className="fas fa-clock"></i>
                        <p>Open: Mon-Fri, 7:30 AM - 9:00 PM</p>
                    </div>
                </div>
            </section>
        </div>
    );
}