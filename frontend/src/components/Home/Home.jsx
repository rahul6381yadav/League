import React, { useState, useEffect } from 'react';
import './Home.css';

function Home() {
    const [isHeaderHidden, setIsHeaderHidden] = useState(false);
    useEffect(() => {
    let lastScrollTop = 0;
    const handleScroll = () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll > lastScrollTop) {
            setIsHeaderHidden(true);
        } else {
            setIsHeaderHidden(false);
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="app">
            {/* Header */}
            <header className={`header ${isHeaderHidden ? 'hidden' : ''}`}>
                <div className="logo">Achieva</div>
                <nav className="nav">
                    <a href="cosa_page">COSA</a>
                    <a href="club_page">CLUBS</a>
                    <a href="#shopping-cart">
                        <img src="https://img.icons8.com/ios/59997/shopping-cart.png" alt="Shopping Cart" className="shopping-cart-icon" />
                    </a>



                    <a href="#coins">
                        <img src="https://img.icons8.com/?size=80&id=iqkTuaHn43hC&format=png" alt="Coins" className="coins-icon" />
                    </a>



                </nav>
            </header>

            {/* Hero Section */}
            <section className="hero" id="home">
                <h1>Welcome to Achieva</h1>
                <p>Your path to success starts here!</p>
                <button>Get Started</button>
            </section>

            {/* Features Section */}
            <section className="features" id="features">
                <h2>Our Features</h2>
                <br /><br />
                <div className="feature-list">
                    <div className="feature-item">
                        <h3><img src="https://img.icons8.com/?size=100&id=11225&format=png&color=FFFFFF" alt="Prize" className="feature-icon" />
                            <br></br>Student of the Year

                        </h3>
                        <p>Track your achievements and earn rewards.</p>
                    </div>
                    <div className="feature-item">
                        <h3><img src="https://img.icons8.com/?size=100&id=xJ769GpFdv4y&format=png&color=FFFFFF" alt="calender" className="feature-icon" /><br></br>Upcoming Events</h3>
                        <p>Stay updated with all the latest events.</p>
                    </div>
                    <div className="feature-item">
                        <h3><img src="https://img.icons8.com/?size=100&id=102091&format=png&color=FFFFFF" alt="leaderboard" className="feature-icon" /><br></br>Leaderboard</h3>
                        <p>See how you rank among your peers.</p>
                    </div>
                </div>
            </section>
            <br /><br />
            {/* About Section */}
            <section className="about" id="about">
                <h2>About Us</h2>
                <p>
                    Achieva is a platform dedicated to helping students reach their goals.
                    We believe in celebrating every success and providing tools for growth.
                </p>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2024 Achieva. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default Home;