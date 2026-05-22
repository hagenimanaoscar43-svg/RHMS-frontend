import React, { useState } from 'react';

const AboutDeveloper = () => {
    const developer = {
        name: "Hagenimana Oscar",
        role: "Founder & Lead Developer",
        title: "Creator of RHMS - Rwanda Hotel Management System",
        shortBio: "Passionate software engineer dedicated to building innovative solutions that transform the hospitality industry in Rwanda.",
        bio: "Based in Kigali, Rwanda, I specialize in creating comprehensive digital solutions that address real-world challenges in the hospitality sector. With expertise in modern web technologies, I've developed RHMS to streamline hotel management, booking systems, and regulatory compliance for the Rwanda Development Board.",
        longBio: "My journey in software development began with a vision to digitize and modernize hotel operations across Rwanda, making management accessible, efficient, and transparent for all stakeholders including RDB, hotel owners, staff, and guests. I focus on creating scalable, secure, and user-friendly platforms that drive efficiency and transparency in the hospitality industry.",
        location: "Kigali, Rwanda",
        email: "hagenimanaoscar43@gmail.com",
        phone: "+250 791970956",
        photo1: "/assets/images/developer1.jpeg",
        photo2: "/assets/images/developer2.jpeg",
        photo3: "/assets/images/developer3.jpeg",
        photo4: "/assets/images/developer4.jpeg",
        // ONLY TECHNOLOGIES USED TO BUILD RHMS
        technologies: [
            "React.js", "Node.js", "PostgreSQL", "Express.js",
            "JavaScript ES6+", "HTML5", "CSS3", "JWT Authentication",
            "RESTful APIs", "Bcrypt", "Nodemailer", "Multer",
            "Socket.io", "Chart.js", "Recharts", "Axios"
        ],
        achievements: [
            "🏆 RHMS - Complete Hotel Management System serving 25+ hotels",
            "🏆 RDB Integration for Government Hotel Licensing & Approval",
            "🏆 2FA Security Implementation for all user roles",
            "🏆 Real-time Chat & Notification System",
            "🏆 Comprehensive Salary & Attendance Management",
            "🏆 Multi-role Dashboard System (RDB, Admin, Employee, Client)"
        ],
        education: {
            degree: "Bachelor's in Computer Science",
            university: "University of Rwanda",
            graduation: "2024"
        },
        engagement: {
            title: "Additional Engagement",
            items: [
                "Active in youth-focused initiatives and community discussions",
                "Interested in using technology and education as tools for national development and transformation",
                "Ability to connect technology with real-world societal challenges",
                "Volunteer in community technology education programs",
                "Mentor for aspiring young developers in Rwanda"
            ]
        }
    };

    const [activeImage, setActiveImage] = useState(0);
    const images = [developer.photo1, developer.photo2, developer.photo3, developer.photo4];

    const handleWhatsApp = () => {
        let phone = developer.phone.replace(/\D/g, '');
        if (phone.length === 9) phone = '250' + phone;
        window.open(`https://wa.me/${phone}`, '_blank');
    };

    const handleEmail = () => {
        window.location.href = `mailto:${developer.email}`;
    };

    const handleCall = () => {
        window.location.href = `tel:${developer.phone}`;
    };

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <div style={styles.hero}>
                <div style={styles.heroOverlay}></div>
                <div style={styles.heroContent}>
                    <div style={styles.badge}>✨ CREATOR & LEAD DEVELOPER ✨</div>
                    <h1 style={styles.name}>{developer.name}</h1>
                    <p style={styles.title}>{developer.title}</p>
                    <div style={styles.heroButtons}>
                        <button onClick={handleWhatsApp} style={styles.btnWhatsapp}>💬 WhatsApp</button>
                        <button onClick={handleCall} style={styles.btnCall}>📞 Call</button>
                        <button onClick={handleEmail} style={styles.btnEmail}>✉️ Email</button>
                    </div>
                </div>
            </div>

            {/* Photo Position 1: TOP - Large Circle */}
            <div style={styles.photoTopSection}>
                <div style={styles.photoTopContainer}>
                    <div style={styles.photoTop}>
                        <img 
                            src={images[0]} 
                            alt={developer.name}
                            style={styles.photoTopImg}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/180x180?text=HO'}
                        />
                    </div>
                    <div style={styles.photoTopContent}>
                        <h2 style={styles.sectionTitle}>The Visionary Behind <span style={styles.accent}>RHMS</span></h2>
                        <p style={styles.photoTopBio}>{developer.shortBio}</p>
                    </div>
                </div>
            </div>

            {/* Bio & Info Section */}
            <div style={styles.bioSection}>
                <div style={styles.bioGrid}>
                    <div style={styles.bioContent}>
                        <h3 style={styles.subTitle}>About Me</h3>
                        <p style={styles.bioText}>{developer.bio}</p>
                        <p style={styles.bioText}>{developer.longBio}</p>
                        <div style={styles.infoGrid}>
                            <div style={styles.infoCard}>
                                <span style={styles.infoIcon}>📍</span>
                                <div>
                                    <div style={styles.infoLabel}>Location</div>
                                    <div style={styles.infoValue}>{developer.location}</div>
                                </div>
                            </div>
                            <div style={styles.infoCard}>
                                <span style={styles.infoIcon}>🎓</span>
                                <div>
                                    <div style={styles.infoLabel}>Education</div>
                                    <div style={styles.infoValue}>{developer.education.degree}</div>
                                    <div style={styles.infoSmall}>{developer.education.university}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>25+</div>
                            <div style={styles.statLabel}>Hotels Onboarded</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>4+</div>
                            <div style={styles.statLabel}>Years Experience</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>98%</div>
                            <div style={styles.statLabel}>Satisfaction</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>12+</div>
                            <div style={styles.statLabel}>Projects</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Photo Position 2: MIDDLE - Circular Gallery */}
            <div style={styles.photoMiddleSection}>
                <h2 style={styles.sectionTitleCentered}>Moments & <span style={styles.accent}>Milestones</span></h2>
                <div style={styles.photoGallery}>
                    {images.map((img, index) => (
                        <div 
                            key={index}
                            style={styles.photoCircle}
                            onMouseEnter={() => setActiveImage(index)}
                        >
                            <img 
                                src={img} 
                                alt={`${developer.name} ${index + 1}`}
                                style={styles.photoCircleImg}
                                onError={(e) => e.target.src = 'https://via.placeholder.com/120x120?text=HO'}
                            />
                            <div style={styles.photoOverlay}>
                                <span>View</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Technologies Used in RHMS Section */}
            <div style={styles.techSection}>
                <h2 style={styles.sectionTitleCentered}>Technologies Used to <span style={styles.accent}>Build RHMS</span></h2>
                <div style={styles.techContainer}>
                    <div style={styles.techCategory}>
                        <h3 style={styles.categoryTitle}> Frontend</h3>
                        <div style={styles.techList}>
                            {developer.technologies.filter(t => ['React.js', 'JavaScript ES6+', 'HTML5', 'CSS3', 'Chart.js', 'Recharts', 'Axios'].includes(t)).map((tech, index) => (
                                <span key={index} style={styles.techBadge}>{tech}</span>
                            ))}
                        </div>
                    </div>
                    <div style={styles.techCategory}>
                        <h3 style={styles.categoryTitle}> Backend</h3>
                        <div style={styles.techList}>
                            {developer.technologies.filter(t => ['Node.js', 'Express.js', 'JWT Authentication', 'RESTful APIs', 'Bcrypt', 'Nodemailer', 'Multer', 'Socket.io'].includes(t)).map((tech, index) => (
                                <span key={index} style={styles.techBadge}>{tech}</span>
                            ))}
                        </div>
                    </div>
                    <div style={styles.techCategory}>
                        <h3 style={styles.categoryTitle}> Database</h3>
                        <div style={styles.techList}>
                            {developer.technologies.filter(t => ['PostgreSQL'].includes(t)).map((tech, index) => (
                                <span key={index} style={styles.techBadge}>{tech}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Achievements Section */}
            <div style={styles.achievementsWrapper}>
                <h2 style={styles.sectionTitleCentered}>Key <span style={styles.accent}>Achievements</span></h2>
                <div style={styles.achievementsGrid}>
                    {developer.achievements.map((achievement, index) => (
                        <div key={index} style={styles.achievementCard}>
                            <span style={styles.achievementIcon}>🏆</span>
                            <span>{achievement}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Photo Position 3: BOTTOM - Community Engagement with Circle Photo */}
            <div style={styles.engagementSection}>
                <div style={styles.engagementContainer}>
                    <div style={styles.engagementPhoto}>
                        <img 
                            src={images[3]} 
                            alt={developer.name}
                            style={styles.engagementPhotoImg}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/150x150?text=HO'}
                        />
                    </div>
                    <div style={styles.engagementContent}>
                        <h3 style={styles.subTitle}>{developer.engagement.title}</h3>
                        <div style={styles.engagementList}>
                            {developer.engagement.items.map((item, index) => (
                                <div key={index} style={styles.engagementItem}>
                                    <span style={styles.engagementIcon}></span>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact CTA Section */}
            <div style={styles.ctaSection}>
                <div style={styles.ctaContent}>
                    <h2 style={styles.ctaTitle}>Let's Work Together</h2>
                    <p style={styles.ctaText}>Have a project in mind? I'd love to hear from you.</p>
                    <div style={styles.ctaButtons}>
                        <button onClick={handleWhatsApp} style={styles.ctaWhatsapp}>💬 WhatsApp Me</button>
                        <button onClick={handleEmail} style={styles.ctaEmail}>📧 Send Email</button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
                <p>RHMS - Rwanda Hotel Management System</p>
                <p style={styles.copyright}>© 2025 {developer.name} | All Rights Reserved</p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "1400px",
        margin: "0 auto",
        background: "#0a0a0a",
        minHeight: "100vh"
    },
    hero: {
        position: "relative",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        padding: "100px 40px",
        textAlign: "center",
        overflow: "hidden"
    },
    heroOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.15) 0%, transparent 50%)"
    },
    heroContent: {
        position: "relative",
        maxWidth: "800px",
        margin: "0 auto",
        zIndex: 1
    },
    badge: {
        display: "inline-block",
        background: "rgba(102, 126, 234, 0.2)",
        backdropFilter: "blur(10px)",
        padding: "8px 20px",
        borderRadius: "40px",
        fontSize: "12px",
        letterSpacing: "2px",
        color: "#a78bfa",
        marginBottom: "24px"
    },
    name: {
        fontSize: "56px",
        fontWeight: "700",
        background: "linear-gradient(135deg, #fff 0%, #a78bfa 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: "16px"
    },
    title: {
        fontSize: "20px",
        color: "#e0e0e0",
        marginBottom: "32px"
    },
    heroButtons: {
        display: "flex",
        gap: "20px",
        justifyContent: "center",
        flexWrap: "wrap"
    },
    btnWhatsapp: {
        padding: "12px 28px",
        background: "#25D366",
        color: "white",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        transition: "transform 0.3s"
    },
    btnCall: {
        padding: "12px 28px",
        background: "#4f46e5",
        color: "white",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        transition: "transform 0.3s"
    },
    btnEmail: {
        padding: "12px 28px",
        background: "#dc2626",
        color: "white",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        transition: "transform 0.3s"
    },
    photoTopSection: {
        padding: "60px 40px",
        background: "#0f0f0f"
    },
    photoTopContainer: {
        display: "flex",
        alignItems: "center",
        gap: "50px",
        maxWidth: "1000px",
        margin: "0 auto",
        flexWrap: "wrap"
    },
    photoTop: {
        width: "180px",
        height: "180px",
        borderRadius: "50%",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        border: "4px solid #a78bfa"
    },
    photoTopImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },
    photoTopContent: {
        flex: 1
    },
    sectionTitle: {
        fontSize: "32px",
        fontWeight: "700",
        color: "white",
        marginBottom: "16px"
    },
    accent: {
        color: "#a78bfa"
    },
    photoTopBio: {
        fontSize: "16px",
        color: "#c0c0c0",
        lineHeight: "1.6"
    },
    bioSection: {
        padding: "40px 40px",
        background: "#0f0f0f",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)"
    },
    bioGrid: {
        maxWidth: "1200px",
        margin: "0 auto"
    },
    bioContent: {
        marginBottom: "40px"
    },
    subTitle: {
        fontSize: "24px",
        fontWeight: "600",
        color: "white",
        marginBottom: "20px"
    },
    bioText: {
        fontSize: "15px",
        color: "#b0b0b0",
        lineHeight: "1.7",
        marginBottom: "16px"
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginTop: "30px"
    },
    infoCard: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "15px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "12px"
    },
    infoIcon: {
        fontSize: "28px"
    },
    infoLabel: {
        fontSize: "12px",
        color: "#a0a0a0"
    },
    infoValue: {
        fontSize: "15px",
        color: "white",
        fontWeight: "500"
    },
    infoSmall: {
        fontSize: "12px",
        color: "#a78bfa"
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        marginTop: "20px"
    },
    statCard: {
        textAlign: "center",
        padding: "20px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "16px"
    },
    statValue: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#a78bfa"
    },
    statLabel: {
        fontSize: "12px",
        color: "#a0a0a0",
        marginTop: "8px"
    },
    photoMiddleSection: {
        padding: "60px 40px",
        background: "#0a0a0a",
        textAlign: "center"
    },
    sectionTitleCentered: {
        fontSize: "32px",
        fontWeight: "700",
        color: "white",
        marginBottom: "40px",
        textAlign: "center"
    },
    photoGallery: {
        display: "flex",
        justifyContent: "center",
        gap: "30px",
        flexWrap: "wrap",
        maxWidth: "1000px",
        margin: "0 auto"
    },
    photoCircle: {
        position: "relative",
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
        transition: "transform 0.3s"
    },
    photoCircleImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },
    photoOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0,
        transition: "opacity 0.3s",
        color: "white",
        fontSize: "12px"
    },
    techSection: {
        padding: "60px 40px",
        background: "#0f0f0f"
    },
    techContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "30px",
        maxWidth: "1200px",
        margin: "0 auto"
    },
    techCategory: {
        background: "rgba(255,255,255,0.03)",
        padding: "25px",
        borderRadius: "20px"
    },
    categoryTitle: {
        fontSize: "20px",
        fontWeight: "600",
        color: "#a78bfa",
        marginBottom: "20px"
    },
    techList: {
        display: "flex",
        flexWrap: "wrap",
        gap: "10px"
    },
    techBadge: {
        padding: "8px 16px",
        background: "rgba(167, 139, 250, 0.15)",
        color: "#a78bfa",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "500"
    },
    achievementsWrapper: {
        padding: "60px 40px",
        background: "#0a0a0a"
    },
    achievementsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "20px",
        maxWidth: "1200px",
        margin: "0 auto"
    },
    achievementCard: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "18px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        color: "#c0c0c0",
        fontSize: "14px"
    },
    achievementIcon: {
        fontSize: "24px"
    },
    engagementSection: {
        padding: "60px 40px",
        background: "linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)"
    },
    engagementContainer: {
        display: "flex",
        alignItems: "center",
        gap: "50px",
        maxWidth: "1000px",
        margin: "0 auto",
        flexWrap: "wrap"
    },
    engagementPhoto: {
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        border: "3px solid #a78bfa"
    },
    engagementPhotoImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },
    engagementContent: {
        flex: 1
    },
    engagementList: {
        marginTop: "20px"
    },
    engagementItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 0",
        color: "#c0c0c0",
        fontSize: "14px",
        lineHeight: "1.5"
    },
    engagementIcon: {
        fontSize: "18px"
    },
    ctaSection: {
        padding: "80px 40px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        textAlign: "center"
    },
    ctaContent: {
        maxWidth: "600px",
        margin: "0 auto"
    },
    ctaTitle: {
        fontSize: "36px",
        fontWeight: "700",
        color: "white",
        marginBottom: "16px"
    },
    ctaText: {
        fontSize: "18px",
        color: "rgba(255,255,255,0.9)",
        marginBottom: "32px"
    },
    ctaButtons: {
        display: "flex",
        gap: "20px",
        justifyContent: "center",
        flexWrap: "wrap"
    },
    ctaWhatsapp: {
        padding: "14px 32px",
        background: "#25D366",
        color: "white",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "600"
    },
    ctaEmail: {
        padding: "14px 32px",
        background: "white",
        color: "#667eea",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "600"
    },
    footer: {
        padding: "40px",
        textAlign: "center",
        background: "#050505",
        color: "#666",
        fontSize: "14px"
    },
    copyright: {
        marginTop: "10px",
        fontSize: "12px",
        color: "#444"
    }
};

export default AboutDeveloper;